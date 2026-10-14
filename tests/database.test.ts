import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const u1 = '11111111-1111-4111-8111-111111111111';
const u2 = '22222222-2222-4222-8222-222222222222';
test('database enforces credit accounting, idempotency, ownership and RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create schema auth; create role anon; create role authenticated; create role service_role; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated;`,
    );
    const sql = (await readFile('supabase/migrations/001_promptly.sql', 'utf8')).replace(
      'create extension if not exists pgcrypto;',
      '',
    );
    await db.exec(sql);
    await db.query('insert into auth.users(id) values ($1),($2)', [u1, u2]);
    const balance = async (user = u1) =>
      Number(
        (await db.query<{ balance: number }>('select balance from profiles where id=$1', [user]))
          .rows[0].balance,
      );
    assert.equal(await balance(), 0);
    await db.query(`select credit_purchase($1,'payment-1',100,'Test top-up')`, [u1]);
    await db.query(`select credit_purchase($1,'payment-1',100,'Duplicate delivery')`, [u1]);
    assert.equal(await balance(), 100, 'webhook retry must not credit twice');
    const plan = async (cost = 19, expires = '15 minutes', snapshot: unknown[] = []) => {
      const id = crypto.randomUUID();
      await db.query(
        `insert into plans(id,user_id,prompt,title,steps,agent_snapshot,total,expires_at) values($1,$2,'Test task','Test title',$3,$4,$5,now()+$6::interval)`,
        [
          id,
          u1,
          JSON.stringify([{ agentId: 'researcher', price: cost }]),
          JSON.stringify(snapshot),
          cost,
          expires,
        ],
      );
      return id;
    };
    const p = await plan();
    await assert.rejects(db.query('select claim_run($1,$2)', [p, u2]), /plan unavailable/);
    const r = String(
      (await db.query<{ claim_run: string }>('select claim_run($1,$2)', [p, u1])).rows[0].claim_run,
    );
    assert.equal(await balance(), 81);
    await assert.rejects(db.query('select claim_run($1,$2)', [p, u1]), /plan unavailable/);
    const competing = await plan();
    await assert.rejects(
      db.query('select claim_run($1,$2)', [competing, u1]),
      /another run active/,
    );
    assert.equal(await balance(), 81, 'failed transaction must not debit');
    await db.query(`select finish_run($1,$2,false,'Refunded','[]')`, [r, u1]);
    await db.query(`select finish_run($1,$2,false,'Duplicate refund','[]')`, [r, u1]);
    assert.equal(await balance(), 100, 'refund is applied exactly once');
    const expensive = await plan(101);
    await assert.rejects(
      db.query('select claim_run($1,$2)', [expensive, u1]),
      /insufficient balance/,
    );
    const expired = await plan(10, '-1 minute');
    await assert.rejects(db.query('select claim_run($1,$2)', [expired, u1]), /expired/);
    const agentId = crypto.randomUUID();
    await db.query(
      `insert into agents(id,owner_id,name,tagline,description,category,price,author,system_prompt) values($1,$2,'Test','Test','Test','Writing',10,'Builder','Write well')`,
      [agentId, u2],
    );
    const paid = await plan(14, '15 minutes', [{ id: agentId, owner_id: u2, price: 10 }]);
    const paidRun = (await db.query<{ claim_run: string }>('select claim_run($1,$2)', [paid, u1]))
      .rows[0].claim_run;
    await db.query(`select finish_run($1,$2,true,'Success','[]')`, [paidRun, u1]);
    await db.query(`select finish_run($1,$2,true,'Duplicate','[]')`, [paidRun, u1]);
    assert.equal(await balance(), 86);
    assert.equal(
      Number(
        (await db.query<{ credits: string }>('select credits from developer_earnings')).rows[0]
          .credits,
      ),
      8,
    );
    const stale = await plan(5);
    const staleRun = (await db.query<{ claim_run: string }>('select claim_run($1,$2)', [stale, u1]))
      .rows[0].claim_run;
    await db.query(`update runs set created_at=now()-interval '6 minutes' where id=$1`, [staleRun]);
    await db.query('select recover_stale_runs($1)', [u1]);
    assert.equal(await balance(), 86);
    const ledger = Number(
      (
        await db.query<{ total: number }>(
          'select sum(amount) as total from transactions where user_id=$1',
          [u1],
        )
      ).rows[0].total,
    );
    assert.equal(ledger, 86);
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${u2}';`);
    assert.equal(
      (await db.query('select * from runs')).rows.length,
      0,
      'other users cannot read runs',
    );
    await assert.rejects(
      db.query('update profiles set balance=999999 where id=$1', [u2]),
      /permission denied/,
    );
    await assert.rejects(
      db.query(`select credit_purchase($1,'attack',100,'attack')`, [u2]),
      /permission denied/,
    );
    await db.exec('reset role');
  } finally {
    await db.close();
  }
});
