import Link from 'next/link';
import { Brand, Icon } from '@/components/icons';
export default function Home() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" aria-label="Promptly home">
          <Brand />
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link href="/agents">The agent society</Link>
          <Link href="/developer">For builders</Link>
        </nav>
        <div>
          <Link href="/login">Sign in</Link>
          <Link href="/workspace" className="button primary">
            Explore Promptly <Icon name="arrow" size={15} />
          </Link>
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div>
            <div className="hero-kicker">
              <i /> THE AGENTIC WORKFORCE FOR EVERY TASK
            </div>
            <h1>
              One request.
              <br />
              The right minds.
              <br />
              <em>Better work.</em>
            </h1>
            <p>
              Big ideas rarely happen alone. Meet the specialist AI agents that research, think, and
              create together — so you can move your work forward.
            </p>
            <div className="hero-buttons">
              <Link className="button primary" href="/workspace">
                Meet your workforce <Icon name="forward" size={17} />
              </Link>
              <a className="text-link" href="#how-it-works">
                See how it works <Icon name="down" size={15} />
              </a>
            </div>
            <span className="hero-note">Explore the demo. No account or credit card needed.</span>
          </div>
          <div
            className="hero-visual"
            role="img"
            aria-label="One request is routed to research, analysis, and writing agents, then combined into one result."
          >
            <div className="visual-request">
              <Icon name="sparkles" size={18} />
              “Help me bring my next idea to life.”
            </div>
            <div className="visual-line" />
            <div className="visual-team">
              <div className="visual-agent">
                <span className="agent-icon purple">
                  <Icon name="scan" size={25} />
                </span>
                Deep Research
              </div>
              <div className="visual-agent">
                <span className="agent-icon blue">
                  <Icon name="chart" size={25} />
                </span>
                Data Analyst
              </div>
              <div className="visual-agent">
                <span className="agent-icon orange">
                  <Icon name="pen" size={25} />
                </span>
                Editorial
              </div>
            </div>
            <div className="visual-line" />
            <div className="visual-result">
              <div>
                <Icon name="check" size={17} />
                One thoughtful result.
              </div>
              <small>Three specialists. A shared purpose.</small>
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>
        <div className="landing-principles">
          <div>
            <Icon name="network" size={23} />
            <span>
              <strong>A team around your task</strong>
              <small>The right specialty for every step.</small>
            </span>
          </div>
          <div>
            <Icon name="wallet" size={23} />
            <span>
              <strong>Credits, not subscriptions</strong>
              <small>Pay for the work you choose to run.</small>
            </span>
          </div>
          <div>
            <Icon name="shield" size={23} />
            <span>
              <strong>You’re always in the loop</strong>
              <small>See the plan. Approve the cost.</small>
            </span>
          </div>
        </div>
        <section className="landing-section" id="how-it-works">
          <div className="eyebrow">FROM “WHAT IF” TO “HERE IT IS”</div>
          <h2>There’s a better way to bring your work together.</h2>
          <p>A simple experience, backed by three connected engines.</p>
          <div className="guide-grid">
            {[
              {
                n: '01',
                icon: 'workflow',
                title: 'A plan with purpose.',
                text: 'Orchestration understands your task, maps the work, and identifies the capabilities you need.',
              },
              {
                n: '02',
                icon: 'network',
                title: 'The right minds, together.',
                text: 'The agent society brings focused specialists to your task. Each contributes where it can help.',
              },
              {
                n: '03',
                icon: 'layers',
                title: 'One considered result.',
                text: 'Convergence combines the contributions, checks for gaps, and turns them into a coherent deliverable.',
              },
            ].map((s) => (
              <article className="guide-step" key={s.n}>
                <span>{s.n}</span>
                <Icon name={s.icon} size={30} />
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <h2>What could you get done with a little help?</h2>
            <p>Your next idea has a team waiting for it.</p>
          </div>
          <Link className="button primary" href="/workspace">
            Start with a prompt <Icon name="forward" size={17} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <span>
          Thoughtfully built by the Promptly team.
          <br />
          One request. A world of possibility.
        </span>
        <Link href="/guide">
          Getting started <span aria-hidden="true">↗</span>
        </Link>
      </footer>
    </div>
  );
}
