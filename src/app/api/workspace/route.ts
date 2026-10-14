import { NextResponse } from 'next/server';
import { authenticate, fail, agentFromRow, runFromRow } from '@/lib/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const stale = await db.rpc('recover_stale_runs', { p_user_id: user.id });
    if (stale.error) throw stale.error;
    const results = await Promise.all([
      db.from('profiles').select('*').eq('id', user.id).single(),
      db
        .from('runs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
      db
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
      db
        .from('agents')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    for (const r of results) if (r.error) throw r.error;
    const [profile, runs, ledger, agents] = results;
    return NextResponse.json(
      {
        name: profile.data.name,
        balance: profile.data.balance,
        favorites: profile.data.favorites,
        runs: runs.data!.map(runFromRow),
        transactions: ledger.data!.map((t) => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          createdAt: t.created_at,
        })),
        agents: agents.data!.map((a) => {
          const agent = agentFromRow(a);
          delete agent.systemPrompt;
          return agent;
        }),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (e) {
    return fail(e);
  }
}
