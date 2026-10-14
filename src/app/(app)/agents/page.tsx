'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { AgentCard } from '@/components/agent-card';
import { AgentDetail } from '@/components/agent-detail';
import { useWorkspace } from '@/components/provider';
import { categories } from '@/lib/catalog';
import type { Agent } from '@/lib/types';
export default function Agents() {
  const { agents, workspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All agents');
  const [saved, setSaved] = useState(false);
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState<Agent | null>(null);
  let visible = agents.filter(
    (a) =>
      (category === 'All agents' || a.category === category) &&
      (!saved || workspace.favorites.includes(a.id)) &&
      `${a.name} ${a.description} ${a.capabilities.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === 'price') visible = [...visible].sort((a, b) => a.price - b.price);
  if (sort === 'name') visible = [...visible].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">THE AGENT SOCIETY</div>
        <h1>
          Find your kind of <em>brilliant.</em>
        </h1>
        <p>Specialist minds for whatever’s on yours. Build your team, one task at a time.</p>
      </div>
      <div className="market-banner">
        <div>
          <span className="pill">BETTER, TOGETHER</span>
          <h2>Great work is a team effort.</h2>
          <p>From the first question to the final draft, there’s a specialist for that.</p>
        </div>
        <div className="agent-constellation" aria-hidden="true">
          <span className="agent-icon blue">
            <Icon name="chart" size={26} />
          </span>
          <span className="agent-icon purple">
            <Icon name="scan" size={30} />
          </span>
          <span className="agent-icon orange">
            <Icon name="pen" size={25} />
          </span>
        </div>
      </div>
      <div className="filter-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            placeholder="Search agents, skills, or a task…"
            aria-label="Search agents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className={`button secondary ${saved ? 'selected' : ''}`}
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >
          <Icon name="star" size={16} />
          Saved agents
        </button>
        <select aria-label="Sort agents" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured first</option>
          <option value="price">Lowest price</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <div className="tabs" role="group" aria-label="Agent category">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? 'active' : ''}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="results-label">
        {visible.length} specialists <span>· Transparent pricing. Always.</span>
      </div>
      <div className="agent-grid">
        {visible.map((a) => (
          <AgentCard key={a.id} agent={a} onSelect={setSelected} />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <h3>No specialists found</h3>
          <p>Try another search or clear your filters.</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery('');
              setCategory('All agents');
              setSaved(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {selected && <AgentDetail agent={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
