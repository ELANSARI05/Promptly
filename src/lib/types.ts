export type Category = 'Research' | 'Writing' | 'Engineering' | 'Operations' | 'Analysis';
export type Agent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  color: string;
  icon: string;
  price: number;
  author: string;
  capabilities: string[];
  systemPrompt?: string;
  owner_id?: string;
};
export type Step = { agentId: string; title: string; purpose: string; price: number };
export type Plan = {
  id: string;
  prompt: string;
  title: string;
  steps: Step[];
  total: number;
  expiresAt: string;
  mode: 'demo' | 'live';
};
export type Run = {
  id: string;
  title: string;
  prompt: string;
  status: 'completed' | 'failed' | 'running';
  credits: number;
  createdAt: string;
  agentIds: string[];
  result: string;
  outputs?: { agent: string; text: string }[];
  mode: 'demo' | 'live';
};
export type Transaction = { id: string; description: string; amount: number; createdAt: string };
export type Workspace = {
  name: string;
  balance: number;
  runs: Run[];
  transactions: Transaction[];
  favorites: string[];
  agents: Agent[];
};
