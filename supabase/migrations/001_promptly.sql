-- Apply once in the Supabase SQL editor. All financial mutations are service-role only.
create extension if not exists pgcrypto;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null default 'My workspace' check (char_length(name) between 2 and 60),
 balance integer not null default 0 check (balance >= 0),
 favorites jsonb not null default '[]', created_at timestamptz not null default now()
);
create table public.agents (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id),
 name text not null, tagline text not null, description text not null,
 category text not null check(category in ('Research','Writing','Engineering','Operations','Analysis')),
 price integer not null check(price between 1 and 100), author text not null,
 capabilities jsonb not null default '[]', system_prompt text not null,
 published boolean not null default false, created_at timestamptz not null default now()
);
create table public.plans (
 id uuid primary key, user_id uuid not null references public.profiles(id),
 prompt text not null, title text not null, steps jsonb not null, agent_snapshot jsonb not null,
 total integer not null check(total > 0), expires_at timestamptz not null,
 used boolean not null default false, created_at timestamptz not null default now()
);
create table public.runs (
 id uuid primary key default gen_random_uuid(), plan_id uuid not null unique references public.plans(id),
 user_id uuid not null references public.profiles(id), title text not null, prompt text not null,
 status text not null check(status in ('running','completed','failed')),
 credits integer not null check(credits > 0), agent_ids jsonb not null,
 result text not null default '', outputs jsonb not null default '[]', created_at timestamptz not null default now()
);
create table public.transactions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 description text not null, amount integer not null, external_id text unique,
 created_at timestamptz not null default now()
);
create table public.developer_earnings (
 id uuid primary key default gen_random_uuid(), developer_id uuid not null references public.profiles(id),
 run_id uuid not null references public.runs(id), agent_id uuid not null references public.agents(id),
 credits numeric(10,2) not null check(credits > 0), created_at timestamptz not null default now(),
 unique(run_id,agent_id)
);
create index runs_user_time on public.runs(user_id,created_at desc);
create index transactions_user_time on public.transactions(user_id,created_at desc);
create index plans_user_time on public.plans(user_id,created_at desc);
create unique index one_active_run_per_user on public.runs(user_id) where status='running';

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.plans enable row level security;
alter table public.runs enable row level security;
alter table public.transactions enable row level security;
alter table public.developer_earnings enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid());
create policy agent_owner_read on public.agents for select to authenticated using(owner_id=auth.uid());
create policy plan_read on public.plans for select to authenticated using(user_id=auth.uid());
create policy run_read on public.runs for select to authenticated using(user_id=auth.uid());
create policy transaction_read on public.transactions for select to authenticated using(user_id=auth.uid());
create policy earnings_read on public.developer_earnings for select to authenticated using(developer_id=auth.uid());
-- No client insert/update/delete grants or policies. Public catalog is served by the API,
-- which strips private specialist instructions.
revoke all on public.profiles,public.agents,public.plans,public.runs,public.transactions,public.developer_earnings from anon,authenticated;
grant select on public.profiles,public.agents,public.plans,public.runs,public.transactions,public.developer_earnings to authenticated;
grant all on public.profiles,public.agents,public.plans,public.runs,public.transactions,public.developer_earnings to service_role;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id) values(new.id); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict do nothing;

create function public.claim_run(p_plan_id uuid,p_user_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare q public.plans; run_id uuid; current_balance integer;
begin
 select balance into current_balance from public.profiles where id=p_user_id for update;
 if not found then raise exception 'profile missing'; end if;
 select * into q from public.plans where id=p_plan_id and user_id=p_user_id for update;
 if not found or q.used then raise exception 'plan unavailable'; end if;
 if q.expires_at < now() then raise exception 'plan expired'; end if;
 if current_balance < q.total then raise exception 'insufficient balance'; end if;
 if exists(select 1 from public.runs where user_id=p_user_id and status='running') then raise exception 'another run active'; end if;
 update public.profiles set balance=balance-q.total where id=p_user_id;
 update public.plans set used=true where id=q.id;
 insert into public.runs(plan_id,user_id,title,prompt,status,credits,agent_ids)
 values(q.id,p_user_id,q.title,q.prompt,'running',q.total,(select jsonb_agg(s->>'agentId') from jsonb_array_elements(q.steps) s)) returning id into run_id;
 insert into public.transactions(user_id,description,amount,external_id) values(p_user_id,q.title,-q.total,'run:'||run_id::text);
 return run_id;
end; $$;

create function public.finish_run(p_run_id uuid,p_user_id uuid,p_success boolean,p_result text,p_outputs jsonb) returns void language plpgsql security definer set search_path='' as $$
declare r public.runs; a jsonb;
begin
 -- Consistent lock order with claim_run: profile before run.
 perform 1 from public.profiles where id=p_user_id for update;
 select * into r from public.runs where id=p_run_id and user_id=p_user_id for update;
 if not found then raise exception 'run missing'; end if;
 if r.status <> 'running' then return; end if;
 update public.runs set status=case when p_success then 'completed' else 'failed' end,result=p_result,outputs=p_outputs where id=r.id;
 if not p_success then
  update public.profiles set balance=balance+r.credits where id=p_user_id;
  insert into public.transactions(user_id,description,amount,external_id) values(p_user_id,'Run refund · '||r.title,r.credits,'refund:'||r.id::text);
 else
  for a in select jsonb_array_elements(agent_snapshot) from public.plans where id=r.plan_id loop
   if a->>'owner_id' is not null then
    insert into public.developer_earnings(developer_id,run_id,agent_id,credits)
    values((a->>'owner_id')::uuid,r.id,(a->>'id')::uuid,(a->>'price')::numeric*0.8) on conflict do nothing;
   end if;
  end loop;
 end if;
end; $$;

create function public.credit_purchase(p_user_id uuid,p_session_id text,p_credits integer,p_description text) returns void language plpgsql security definer set search_path='' as $$
declare added integer;
begin
 if p_credits not in (100,500,1200) then raise exception 'invalid pack'; end if;
 perform 1 from public.profiles where id=p_user_id for update;
 if not found then raise exception 'profile missing'; end if;
 insert into public.transactions(user_id,description,amount,external_id) values(p_user_id,p_description,p_credits,'stripe:'||p_session_id) on conflict(external_id) do nothing;
 get diagnostics added = row_count;
 if added=1 then update public.profiles set balance=balance+p_credits where id=p_user_id; end if;
end; $$;

create function public.recover_stale_runs(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare r record;
begin
 for r in select id from public.runs where user_id=p_user_id and status='running' and created_at < now()-interval '5 minutes' loop
  perform public.finish_run(r.id,p_user_id,false,'The run timed out. Reserved credits have been returned.','[]'::jsonb);
 end loop;
end; $$;

revoke all on function public.handle_new_user() from public,anon,authenticated;
revoke all on function public.claim_run(uuid,uuid) from public,anon,authenticated;
revoke all on function public.finish_run(uuid,uuid,boolean,text,jsonb) from public,anon,authenticated;
revoke all on function public.credit_purchase(uuid,text,integer,text) from public,anon,authenticated;
revoke all on function public.recover_stale_runs(uuid) from public,anon,authenticated;
grant execute on function public.claim_run(uuid,uuid) to service_role;
grant execute on function public.finish_run(uuid,uuid,boolean,text,jsonb) to service_role;
grant execute on function public.credit_purchase(uuid,text,integer,text) to service_role;
grant execute on function public.recover_stale_runs(uuid) to service_role;
