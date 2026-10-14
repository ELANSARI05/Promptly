import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate, fail, readJson, ApiError } from '@/lib/server';
const schema = z.object({
  name: z.string().trim().min(3).max(50),
  tagline: z.string().trim().min(10).max(80),
  description: z.string().trim().min(30).max(1000),
  category: z.enum(['Research', 'Writing', 'Engineering', 'Operations', 'Analysis']),
  price: z.number().int().min(1).max(100),
  systemPrompt: z.string().trim().min(50).max(6000),
  capabilities: z.array(z.string().trim().min(1).max(60)).min(1).max(5),
});
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const data = schema.parse(await readJson(request));
    const { count, error: countError } = await db
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id);
    if (countError) throw countError;
    if ((count || 0) >= 20)
      throw new ApiError('You can publish up to 20 agents in this release.', 429);
    const { systemPrompt, ...rest } = data;
    const { error } = await db
      .from('agents')
      .insert({
        ...rest,
        system_prompt: systemPrompt,
        owner_id: user.id,
        author: String(user.user_metadata?.name || 'Community builder').slice(0, 60),
        published: true,
      });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
