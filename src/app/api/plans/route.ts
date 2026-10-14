import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate, fail, readJson, registry, ApiError } from '@/lib/server';
import { planTask } from '@/lib/planner';
const schema = z.object({
  prompt: z.string().trim().min(20).max(12000),
  agentId: z.string().max(80).optional(),
});
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { prompt, agentId } = schema.parse(await readJson(request));
    const all = await registry(db);
    if (agentId && !all.some((a) => a.id === agentId))
      throw new ApiError('This specialist is no longer available.');
    const { count, error: countError } = await db
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());
    if (countError) throw countError;
    if ((count || 0) >= 60)
      throw new ApiError('You’ve created many plans recently. Please try again in an hour.', 429);
    const plan = { ...planTask(prompt, all, agentId), mode: 'live' as const };
    const snapshot = plan.steps.map((s) => all.find((a) => a.id === s.agentId)!);
    const { error } = await db
      .from('plans')
      .insert({
        id: plan.id,
        user_id: user.id,
        prompt,
        title: plan.title,
        steps: plan.steps,
        total: plan.total,
        expires_at: plan.expiresAt,
        agent_snapshot: snapshot,
      });
    if (error) throw error;
    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
