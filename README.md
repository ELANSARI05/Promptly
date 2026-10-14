# Promptly

A considered workspace for an on-demand AI workforce. Built with Next.js, React, TypeScript, Supabase, OpenAI, and Stripe for Vercel deployment.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 for the product site or http://localhost:3000/workspace for the application. Without environment variables, the full demo works with browser-local data and clearly labeled sample output.

## Connect live services

1. Create a Supabase project and run [`supabase/migrations/001_promptly.sql`](supabase/migrations/001_promptly.sql) in its SQL editor. This creates tables, row-level security, signup initialization, and atomic credit functions.
2. Enable Supabase email/password auth. Set the Site URL to the deployed origin and allow `<origin>/workspace` as an auth redirect. Configure confirmation email delivery before public launch.
3. Copy `.env.example` to `.env.local` and enter your own Supabase URL, anon/publishable key, service-role key, OpenAI key, and model identifier. Keep service-role, AI, and payment keys server-only.
4. For payments, set the Stripe secret key and webhook secret. Configure the Stripe webhook URL to `<origin>/api/billing/webhook` with `checkout.session.completed` and `checkout.session.async_payment_succeeded` events. Start with Stripe test keys.
5. Set `APP_URL` to the exact origin without a trailing slash. Restart or redeploy after setting environment variables.

Live accounts start at zero credits. Stripe-confirmed purchases add credits; failed runs refund them. Demo credit balances do not transfer into accounts.

## Deploy on Vercel

The app uses standard Next.js detection and includes `vercel.json`. Import the GitHub repository, select **Next.js**, leave the root directory at the repository root, and deploy. The build command is `npm run build` and package installation uses the lockfile.

Deploying with no environment variables produces a usable demo. To activate accounts, AI, and payments, add the variables above to the intended Vercel environments and redeploy. Use separate Stripe test/live keys and Supabase projects as appropriate for preview and production. API execution has a 120-second duration setting; confirm your Vercel plan supports that duration.

If using the CLI:

```sh
vercel login
vercel --prod
```

After deployment, verify `/api/health`, account creation, a Stripe test purchase, a successful live task, and an induced provider failure/refund. Test keys do not charge real cards. Do not switch Stripe to live mode until pricing, developer terms, taxes, and payment handling have been reviewed for your business.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome by default. Change `channel: 'chrome'` in `playwright.config.ts` if your environment uses another browser. The test runner starts the production server and stops it afterward. Run `npm run build` after source changes before browser tests. On CI, Chrome is installed by the workflow.

## Project map

- `src/app/(app)`: workspace, marketplace, runs, wallet, developer studio, settings, guide.
- `src/app/api`: authenticated workspace APIs, planning, execution, checkout, Stripe webhook.
- `src/lib`: catalog, intent planner, account clients, server execution, demo data, types.
- `src/components`: shared navigation, accessible native dialogs, task approval, result rendering.
- `supabase/migrations`: database schema and credit transaction functions.
- `tests`: pricing, accounting, ownership, RLS, UI flows, and accessibility.
- [`docs/PRODUCT.md`](docs/PRODUCT.md): reviewed project materials, product interpretation, decisions, and explicit release limits.

## Important boundaries

This release produces text deliverables. It does not browse, send messages, execute user code, or act in external business systems. Agent discovery uses deterministic capability matching. PayPal, multi-member organizations, vector retrieval, container sandboxing, and cash payouts are not implemented. Developer earnings are recorded at an assumed 80% share on successful live runs; withdrawals are not enabled.

Do not expose the Supabase service-role key, OpenAI key, or Stripe secrets in client environment variables. All financial mutations are server-only database functions. An authenticated user's ID comes from a verified access token, never from the request body. Stored quotes control execution price; client-submitted balances or prices are not trusted.

Implementation references: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication), [Supabase auth](https://supabase.com/docs/guides/auth), [OpenAI text generation](https://developers.openai.com/api/docs/guides/text), [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment).
