import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { agents } from './catalog';
import type { Agent, Run } from './types';
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function adminDb() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new ApiError('Live workspace services are not configured yet.', 503);
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function authenticate(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ApiError('Please sign in to continue.', 401);
  const db = adminDb();
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user) throw new ApiError('Your session has expired. Please sign in again.', 401);
  return { db, user };
}
export async function readJson(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 24000)
    throw new ApiError('This request is too large.', 413);
  const text = await request.text();
  if (text.length > 24000) throw new ApiError('This request is too large.', 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('Please send valid JSON.');
  }
}
export function fail(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues.map((i) => i.message).join(' ') },
      { status: 400 },
    );
  console.error(
    'Promptly operation failed:',
    error instanceof Error ? error.message : 'Database or provider failure',
  );
  return NextResponse.json(
    { error: 'The service could not complete this request. Please try again.' },
    { status: 500 },
  );
}
export async function registry(db: ReturnType<typeof adminDb>): Promise<Agent[]> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return [...agents, ...(data || []).map(agentFromRow)];
}
export function agentFromRow(row: Record<string, unknown>): Agent {
  return {
    id: String(row.id),
    name: String(row.name),
    tagline: String(row.tagline),
    description: String(row.description),
    category: row.category as Agent['category'],
    price: Number(row.price),
    author: String(row.author),
    capabilities: row.capabilities as string[],
    systemPrompt: String(row.system_prompt),
    owner_id: String(row.owner_id),
    color: 'lavender',
    icon: 'sparkles',
  };
}
export function runFromRow(row: Record<string, unknown>): Run {
  return {
    id: String(row.id),
    title: String(row.title),
    prompt: String(row.prompt),
    status: row.status as Run['status'],
    credits: Number(row.credits),
    createdAt: String(row.created_at),
    agentIds: row.agent_ids as string[],
    result: String(row.result || ''),
    outputs: (row.outputs || []) as Run['outputs'],
    mode: 'live',
  };
}
