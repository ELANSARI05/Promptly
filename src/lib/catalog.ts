import type { Agent } from './types';
export const agents: Agent[] = [
  {
    id: 'researcher',
    name: 'Deep Research',
    tagline: 'Find the signal in the noise.',
    description:
      'Turns a broad question into a structured research brief. Separates supplied evidence, assumptions, and questions that need further verification.',
    category: 'Research',
    color: 'purple',
    icon: 'scan',
    price: 8,
    author: 'Promptly',
    capabilities: ['Research briefs', 'Source analysis', 'Market mapping'],
    systemPrompt:
      'You are a careful research analyst. Use only supplied context and general knowledge. Do not claim live web access or invent sources. Mark assumptions and facts requiring verification. Produce a structured, useful research brief.',
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    tagline: 'From information to insight.',
    description:
      'Finds patterns, explains trade-offs, and turns supplied data into practical recommendations.',
    category: 'Analysis',
    color: 'blue',
    icon: 'chart',
    price: 6,
    author: 'Promptly',
    capabilities: ['Data interpretation', 'Comparisons', 'Decision support'],
    systemPrompt:
      'Analyze the supplied information. Show calculations when data permits, distinguish facts from assumptions, and recommend clear next steps. Never invent datasets or numerical findings.',
  },
  {
    id: 'writer',
    name: 'Editorial',
    tagline: 'Words that do the work.',
    description:
      'Creates considered, clear writing that matches your audience, voice, and purpose.',
    category: 'Writing',
    color: 'orange',
    icon: 'pen',
    price: 5,
    author: 'Promptly',
    capabilities: ['Content drafts', 'Brand voice', 'Email writing'],
    systemPrompt:
      'You are an expert editor and writer. Deliver a polished draft tailored to the request. Be specific and concise. Do not fabricate evidence or claim actions have been taken.',
  },
  {
    id: 'coder',
    name: 'Code Architect',
    tagline: 'A second pair of expert eyes.',
    description:
      'Reviews code, designs implementations, and explains engineering decisions with actionable examples.',
    category: 'Engineering',
    color: 'green',
    icon: 'code',
    price: 10,
    author: 'Promptly',
    capabilities: ['Code review', 'Architecture', 'Debugging'],
    systemPrompt:
      'You are a senior software engineer. Review supplied code or design a concrete implementation. Identify security and correctness concerns. You cannot execute code; do not claim tests passed.',
  },
  {
    id: 'support',
    name: 'Customer Compass',
    tagline: 'Make every response count.',
    description:
      'Understands customer issues and drafts an empathetic response with a practical resolution plan.',
    category: 'Operations',
    color: 'pink',
    icon: 'heart',
    price: 6,
    author: 'Promptly',
    capabilities: ['Customer support', 'Resolution plans', 'Sentiment analysis'],
    systemPrompt:
      'You are a customer operations specialist. Assess the issue, propose a resolution, and draft an empathetic response. Do not claim refunds, shipping, messages, or changes have occurred. Flag actions needing human approval.',
  },
  {
    id: 'strategist',
    name: 'Strategy Partner',
    tagline: 'A clear path from here.',
    description:
      'Builds actionable launch plans, evaluates opportunities, and brings structure to your next big idea.',
    category: 'Operations',
    color: 'yellow',
    icon: 'compass',
    price: 8,
    author: 'Promptly',
    capabilities: ['Launch plans', 'Prioritization', 'Business strategy'],
    systemPrompt:
      'You are a pragmatic strategist. Develop prioritized recommendations, trade-offs, risks, and measurable next steps. State assumptions explicitly.',
  },
  {
    id: 'reviewer',
    name: 'Quality Check',
    tagline: 'A little more certainty.',
    description:
      'Challenges assumptions and checks completeness before your final answer is delivered.',
    category: 'Analysis',
    color: 'teal',
    icon: 'shield',
    price: 4,
    author: 'Promptly',
    capabilities: ['Fact checking', 'Quality review', 'Risk assessment'],
    systemPrompt:
      'Review the task for missing requirements, contradictions, unsupported claims, and risks. List concrete checks and improvements. Distinguish verifiable evidence from assumptions.',
  },
  {
    id: 'summarizer',
    name: 'Distill',
    tagline: 'Less reading. More understanding.',
    description:
      'Transforms long notes and complex documents into focused summaries and action items.',
    category: 'Writing',
    color: 'lavender',
    icon: 'layers',
    price: 4,
    author: 'Promptly',
    capabilities: ['Summaries', 'Meeting notes', 'Action items'],
    systemPrompt:
      'Summarize supplied content faithfully. Preserve key facts and uncertainties. Extract decisions and next actions; never invent missing source content.',
  },
];
export const categories = [
  'All agents',
  'Research',
  'Writing',
  'Engineering',
  'Operations',
  'Analysis',
] as const;
export const templates = [
  {
    title: 'Research a market',
    subtitle: 'Find your next opportunity',
    icon: 'scan',
    prompt:
      'Build a market research brief for an AI productivity tool for small businesses. Compare customer needs, potential positioning, and key risks. Clearly mark assumptions and facts to verify.',
  },
  {
    title: 'Create something',
    subtitle: 'Turn an idea into a first draft',
    icon: 'pen',
    prompt:
      'Create a launch email and three LinkedIn posts for Promptly, an AI agent workforce that plans tasks, selects specialists, and delivers one result. Use a warm, confident tone.',
  },
  {
    title: 'Solve a problem',
    subtitle: 'Bring a fresh perspective',
    icon: 'compass',
    prompt:
      'A VIP customer received a damaged order two days late and reports a duplicate charge. Propose a resolution plan, draft an apology, and identify what our support team must verify before acting.',
  },
  {
    title: 'Review your code',
    subtitle: 'Build with more confidence',
    icon: 'code',
    prompt:
      'Review the following code for correctness, security, and maintainability. Explain the issues and suggest a corrected version.\n\n[Paste your code here]',
  },
];
