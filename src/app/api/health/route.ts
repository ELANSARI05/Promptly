import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    application: 'Promptly',
    mode:
      process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.OPENAI_API_KEY ? 'live-capable' : 'demo',
  });
}
