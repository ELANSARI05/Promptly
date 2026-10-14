'use client';
import Link from 'next/link';
import { Modal } from './modal';
import { Icon } from './icons';
import type { Agent } from '@/lib/types';
export function AgentDetail({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <Modal title={agent.name} onClose={onClose}>
      <span className={`agent-icon large ${agent.color}`}>
        <Icon name={agent.icon} size={32} />
      </span>
      <h3 className="detail-tagline">{agent.tagline}</h3>
      <p className="detail-description">{agent.description}</p>
      <div className="agent-tags">
        {agent.capabilities.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="detail-facts">
        <div>
          <span>Created by</span>
          <strong>{agent.author}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{agent.category}</strong>
        </div>
        <div>
          <span>Price per run</span>
          <strong>{agent.price} credits</strong>
        </div>
      </div>
      <p className="fineprint">
        This specialist produces text-based analysis and drafts. Your full team and total price are
        shown before execution.
      </p>
      <Link
        href={`/workspace?agent=${encodeURIComponent(agent.id)}`}
        className="button primary full"
        onClick={onClose}
      >
        Start a task with {agent.name}
        <Icon name="forward" size={16} />
      </Link>
    </Modal>
  );
}
