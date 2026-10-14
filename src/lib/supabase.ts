import { createClient } from '@supabase/supabase-js';
export const authConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
let client: ReturnType<typeof createClient> | undefined;
export function browserDb() {
  if (!authConfigured)
    throw new Error(
      'Account access is not configured on this deployment. You can explore the demo workspace.',
    );
  return (client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ));
}
