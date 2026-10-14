import type { Workspace, Plan, Run } from './types';
export const demoResult = (plan: Plan) =>
  `## Your brief, ready for the next step\n\nThis is a **sample deliverable** from the demo workspace. Live AI execution is available after signing in to a configured deployment.\n\n### Your request\n\n${plan.prompt}\n\n### Proposed approach\n\n${plan.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.purpose}`).join('\n')}\n\n### What a live run delivers\n\nEach selected specialist independently works on your request. The convergence engine reviews their outputs, resolves overlaps, and produces a single response. You can inspect each specialist’s contribution alongside the final deliverable.\n\n### Before you act\n\nReview assumptions, verify supporting evidence, and approve any external action separately. Promptly’s initial release produces recommendations and drafts; it does not issue refunds, send messages, or change external systems.`;
export function initialWorkspace(): Workspace {
  // Stable sample timestamps keep server-rendered HTML and browser hydration identical.
  const now = Date.parse('2026-10-14T12:00:00.000Z');
  const records = [
    {
      title: 'A clearer launch story for Promptly',
      agentIds: ['strategist', 'writer', 'reviewer'],
      credits: 17,
      result:
        '## One request. The right minds.\n\n**Sample launch brief**\n\nPromptly brings specialist AI agents together around a single task. Describe the outcome, review the plan and cost, then let your selected team get to work.\n\n### Positioning\n\nAn on-demand AI workforce for people who want a finished deliverable without assembling a chain of tools.\n\n### Launch email\n\nSubject: Your next big task just got a little smaller\n\nMeet Promptly. Tell us what you want to accomplish, and we’ll assemble the right team of AI specialists. See the plan before you start. Pay only for the work you run.\n\n### Next steps\n\nTest the message with five prospective users and compare which tasks they would delegate first.',
    },
    {
      title: 'Customer escalation · resolution plan',
      agentIds: ['support', 'strategist', 'writer'],
      credits: 19,
      result:
        '## A resolution with the customer in mind\n\n**Sample support brief**\n\n1. Verify the order, delivery timeline, and duplicate payment.\n2. Confirm the applicable refund and replacement policies.\n3. Assign an owner to coordinate the resolution.\n\n### Suggested response\n\nI’m sorry your order arrived late and damaged, and that you’re seeing a duplicate charge. I’ll help verify each issue and explain the next steps clearly.\n\nNo refund, replacement, or message has been sent. This is a recommendation for a human support team.',
    },
    {
      title: 'AI productivity · market opportunity',
      agentIds: ['researcher', 'analyst', 'writer'],
      credits: 19,
      result:
        '## A focused starting point\n\n**Sample research brief**\n\n### Audience hypothesis\n\nSmall teams that already use multiple AI tools may value a single place to coordinate research, analysis, and writing.\n\n### Questions to validate\n\n- Which recurring tasks require more than one tool?\n- How do buyers compare per-task pricing with subscriptions?\n- What evidence makes an AI deliverable trustworthy?\n\n### Next experiment\n\nInterview ten potential users using a task-based prototype. These are hypotheses, not verified market findings.',
    },
  ];
  const runs: Run[] = records.map((r, i) => ({
    ...r,
    id: `sample-${i + 1}`,
    prompt: r.title,
    status: 'completed',
    mode: 'demo',
    createdAt: new Date(now - (i + 1) * 86400000).toISOString(),
  }));
  return {
    name: 'My workspace',
    balance: 245,
    runs,
    transactions: [
      {
        id: 'welcome',
        description: 'Demo starting credits',
        amount: 300,
        createdAt: new Date(now - 4 * 86400000).toISOString(),
      },
      ...runs.map((r) => ({
        id: r.id,
        description: r.title,
        amount: -r.credits,
        createdAt: r.createdAt,
      })),
    ],
    favorites: ['researcher', 'writer', 'coder'],
    agents: [],
  };
}
