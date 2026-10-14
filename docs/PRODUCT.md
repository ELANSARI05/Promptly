# Promptly: project interpretation and implementation

## Reviewed sources

- `Scienceweek_Promptly (6).pptx`: all 11 slides, including image-based solution, architecture, and business-model slides.
- `Promptly_Tech_Slides.pptx`: all 6 technical slides.
- `promptly_demo_v2.html` and `promptly_full_demo.html`: the earlier scripted UI flows.
- `promptly_llm_strategy.html` and `promptly_full_agent_workflow.svg`: provider routing and agent discovery concepts.
- README files in the three adjacent `ai-agent-marketplace-main` folders: two copies of a separate FastAPI marketplace and one blockchain marketplace. They are reference projects, not Promptly's application source; their implementation and credentials were not imported.
- `JoinAgent--main`: an unrelated audio/transcription project, excluded after inspecting its structure and README.
- `scienceweek.zip`: contains a video, not an application source tree. The MP4 demonstrations were identified but not reviewed frame by frame.

Document content was treated as project evidence, not instructions to execute embedded actions. Only project-related files were inspected; unrelated personal documents were not read. The presentation and other local source documents are not committed or published.

## Product thesis

Promptly is an agentic workforce with three engines: orchestration, agent society, and convergence. A user describes the outcome, reviews the specialist team and exact cost, confirms execution, and receives a combined result. Developers publish focused agents and set per-run prices. The business model is prepaid credits, not recurring subscriptions.

## Working release

The Next.js application includes a public product page, responsive workspace, task templates, explicit plan approval, marketplace search/category/saved filters, agent details, run history and Markdown downloads, wallet and ledger, developer publishing, workspace settings, help, and email/password account screens.

The application runs in two deliberately separate modes:

- **Demo:** Browser-local persistence, clearly labeled sample deliverables, demo credits with no monetary value, and local-only agent publishing. No provider calls or payment charges are made.
- **Connected:** Supabase identity and PostgreSQL persistence; authenticated server APIs; immutable stored quotes; atomic credit reservation; bounded OpenAI specialist calls and convergence; failure refunds; Stripe Checkout and signature-verified, idempotent fulfillment; community prompt-agent publication and developer earnings accrual.

New live accounts start at zero credits. Demo data is never copied into live accounts, and live account data is never written into demo browser storage.

## Decisions and limits

- Next.js App Router is used to fit Vercel without a separately hosted Python API, Redis, or Kubernetes cluster.
- Agent selection uses transparent intent rules. It is not semantic vector search, GraphRAG, or an LLM planner. A selected community agent is paired with Quality Check.
- Each specialist produces text. No tool integrations, arbitrary code execution, browser research, refunds, emails, or other external actions are performed. This avoids presenting model-generated action descriptions as real actions.
- The convergence pass receives all specialist outputs and is instructed to resolve conflicts and unsupported claims. The app does not invent confidence scores.
- The initial credit packs ($10/100, $45/500, $99/1,200) and 80% developer revenue share are product assumptions, not figures specified in the deck. Confirm them before accepting live payments.
- Stripe card payments are implemented. PayPal and developer cash payouts are not implemented. Developer shares accrue in a database ledger and do not become spendable wallet credits.
- Accounts are personal workspaces, not multi-member organizations. Invitations, organization roles, and shared team permissions are future work.
- Quotes expire after 15 minutes, and there can be one running task per account. Timed-out reservations are refunded when the workspace refreshes after five minutes.
- The initial release limits each user to 20 published agents and 60 new plans per hour. Marketplace queries return up to 200 community agents; history and ledger return the latest 100 entries.
- Agent output is not guaranteed factual; review is required for consequential use. The product explicitly distinguishes recommendations from completed actions.

## Verification

The repository includes planner tests, an executable PostgreSQL compatibility test using PGlite for the complete migration and financial functions, browser flow tests, responsive overflow checks, and accessibility checks. External service integrations require configured accounts and are not claimed to have passed live end-to-end tests without those credentials.
