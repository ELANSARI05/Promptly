'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Brand, Icon } from './icons';
import { useWorkspace } from './provider';
const main = [
  ['/workspace', 'Overview', 'grid'],
  ['/runs', 'My runs', 'workflow'],
  ['/agents', 'Agent marketplace', 'network'],
];
const manage = [
  ['/billing', 'Credits & billing', 'wallet'],
  ['/developer', 'Developer studio', 'code'],
  ['/settings', 'Settings', 'settings'],
];
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { workspace, user, live, signOut } = useWorkspace();
  const [open, setOpen] = useState(false);
  const current =
    [...main, ...manage, ['/guide', 'Getting started', 'book']].find(
      ([url]) => url === path,
    )?.[1] || 'Workspace';
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Link href="/" className="brand-link" aria-label="Promptly home">
          <Brand light />
        </Link>
        <Link href="/settings" className="workspace-switch" onClick={() => setOpen(false)}>
          <span className="workspace-avatar">P</span>
          <span>
            <strong>{workspace.name}</strong>
            <small>{live ? 'Personal workspace' : 'Demo workspace'}</small>
          </span>
          <Icon name="down" size={14} />
        </Link>
        <Link href="/workspace?new=1" className="new-task" onClick={() => setOpen(false)}>
          <Icon name="plus" size={18} /> New task <kbd>N</kbd>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Workspace">
          {main.map(([url, label, icon]) => (
            <Link
              key={url}
              className={path === url ? 'nav-item active' : 'nav-item'}
              href={url}
              onClick={() => setOpen(false)}
            >
              <Icon name={icon} size={19} />
              {label}
              {url === '/runs' && <span className="nav-count">{workspace.runs.length}</span>}
            </Link>
          ))}
        </nav>
        <div className="nav-label nav-label-second">BUILD & MANAGE</div>
        <nav aria-label="Manage">
          {manage.map(([url, label, icon]) => (
            <Link
              key={url}
              className={path === url ? 'nav-item active' : 'nav-item'}
              href={url}
              onClick={() => setOpen(false)}
            >
              <Icon name={icon} size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="credit-widget">
            <span>
              <Icon name="zap" size={15} /> Available credits
            </span>
            <strong>
              {workspace.balance.toLocaleString()} <small>credits</small>
            </strong>
            <div className="credit-track">
              <i style={{ width: `${Math.min(100, workspace.balance / 3)}%` }} />
            </div>
            <Link href="/billing" onClick={() => setOpen(false)}>
              Add credits <Icon name="plus" size={15} />
            </Link>
          </div>
          <Link className="sidebar-help" href="/guide">
            <Icon name="book" size={17} /> Getting started <Icon name="arrow" size={14} />
          </Link>
          <div className="user-row">
            <span className="user-avatar">{user?.email?.slice(0, 2).toUpperCase() || 'YO'}</span>
            <span>
              <strong>{user?.user_metadata?.name || 'Your workspace'}</strong>
              <small>{user?.email || 'Make room for better work'}</small>
            </span>
            {user ? (
              <button title="Sign out" aria-label="Sign out" onClick={signOut}>
                <Icon name="logout" size={16} />
              </button>
            ) : (
              <Link href="/login" title="Sign in" aria-label="Sign in">
                <Icon name="arrow" size={16} />
              </Link>
            )}
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{current}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${live ? 'live' : ''}`}>
              <i />
              {live ? 'Live workspace' : 'Demo workspace'}
            </span>
            <Link href="/guide" className="icon-button" aria-label="Help and guide">
              <Icon name="help" size={19} />
            </Link>
            <Link href="/settings" className="top-avatar" aria-label="Workspace settings">
              {user?.email?.slice(0, 1).toUpperCase() || 'Y'}
            </Link>
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <span className="status-dot" />{' '}
            {live
              ? 'Your workspace, connected.'
              : 'A little less busywork. A little more possibility.'}
          </span>
          <span>Made for the way you work.</span>
        </footer>
      </div>
    </div>
  );
}
