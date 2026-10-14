import { agents } from './catalog';
import type { Agent, Plan } from './types';
export function planTask(prompt: string, registry: Agent[] = agents, preferredId?: string): Plan {
  const text = prompt.toLowerCase();
  let ids: string[];
  if (preferredId && registry.some((a) => a.id === preferredId)) ids = [preferredId, 'reviewer'];
  else if (/code|debug|function|typescript|python|api|software/.test(text))
    ids = ['coder', 'reviewer'];
  else if (/customer|refund|damaged|complaint|support/.test(text))
    ids = ['support', 'strategist', 'writer'];
  else if (/summari|meeting|notes|distill/.test(text)) ids = ['summarizer', 'reviewer'];
  else if (/email|write|content|linkedin|blog|draft|copy/.test(text))
    ids = ['strategist', 'writer', 'reviewer'];
  else if (/data|csv|metrics|numbers|statistics/.test(text)) ids = ['analyst', 'reviewer'];
  else ids = ['researcher', 'analyst', 'writer'];
  ids = [...new Set(ids)];
  const steps = ids
    .map((id) => registry.find((a) => a.id === id))
    .filter((a): a is Agent => !!a)
    .map((a) => ({ agentId: a.id, title: a.name, purpose: a.tagline, price: a.price }));
  return {
    id: crypto.randomUUID(),
    prompt,
    title: prompt.replace(/\s+/g, ' ').slice(0, 75),
    steps,
    total: steps.reduce((sum, s) => sum + s.price, 0),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    mode: 'demo',
  };
}
export function canAfford(balance: number, total: number) {
  return Number.isInteger(total) && total > 0 && balance >= total;
}
