import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate, fail, readJson } from '@/lib/server';
const schema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    favorites: z.array(z.string().max(80)).max(200).optional(),
  })
  .strict();
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const data = schema.parse(await readJson(request));
    const { error } = await db.from('profiles').update(data).eq('id', user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
