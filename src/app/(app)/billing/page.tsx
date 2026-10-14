'use client';
import { useState } from 'react';
import { useWorkspace } from '@/components/provider';
import { Icon } from '@/components/icons';
import { Modal } from '@/components/modal';
import { creditPacks } from '@/lib/billing';
export default function Billing() {
  const { workspace, setWorkspace, live, api, notify, refresh } = useWorkspace();
  const [busy, setBusy] = useState('');
  const [pack, setPack] = useState<(typeof creditPacks)[number] | null>(null);
  async function purchase() {
    if (!pack || busy) return;
    setBusy(pack.id);
    try {
      if (live) {
        const { url } = await api<{ url: string }>('/api/billing/checkout', { packId: pack.id });
        window.location.assign(url);
      } else {
        setWorkspace((w) => ({
          ...w,
          balance: w.balance + pack.credits,
          transactions: [
            {
              id: crypto.randomUUID(),
              description: `Demo top-up · ${pack.credits} credits`,
              amount: pack.credits,
              createdAt: new Date().toISOString(),
            },
            ...w.transactions,
          ],
        }));
        notify(`${pack.credits} demo credits added. No payment was taken.`);
        setPack(null);
      }
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">PAY FOR THE WORK. KEEP THE POSSIBILITIES.</div>
        <h1>
          A little credit. <em>A lot of potential.</em>
        </h1>
        <p>No subscriptions. No surprise charges. Just the work you choose to run.</p>
      </div>
      <div className="two-column">
        <div className="wallet-card">
          <span>
            <Icon name="wallet" size={18} /> Your available balance
          </span>
          <strong>
            {workspace.balance.toLocaleString()} <small>credits</small>
          </strong>
          <p>
            {live
              ? 'Ready for your next task.'
              : 'Demo credits · explore without spending real money.'}
          </p>
          <div className="wallet-note">
            <Icon name="shield" size={17} />
            You approve the full cost before every run.
          </div>
        </div>
        <div className="panel">
          <h2>Simple by design.</h2>
          <p className="panel-subtitle">
            Each specialist sets a price per run. Your plan adds those prices together before you
            approve it.
          </p>
          <div className="detail-facts">
            <div>
              <span>Subscription fee</span>
              <strong>None</strong>
            </div>
            <div>
              <span>Failed runs</span>
              <strong>Credits returned</strong>
            </div>
            <div>
              <span>Orchestration & convergence</span>
              <strong>Included</strong>
            </div>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Make room for your next idea</h2>
            <p>
              {live
                ? 'One-time credit packs. Secure checkout with Stripe.'
                : 'Try a sample top-up. These prices are illustrative until payments are configured.'}
            </p>
          </div>
        </div>
        <div className="credit-packs">
          {creditPacks.map((p) => (
            <article key={p.id} className="credit-pack">
              <span>{p.name}</span>
              <h3>
                {p.credits.toLocaleString()} <small>credits</small>
              </h3>
              <p>${(p.cents / 100).toFixed(0)} USD · one time</p>
              <button
                className={`button ${p.id === 'builder' ? 'primary' : 'secondary'}`}
                onClick={() => setPack(p)}
              >
                {live ? 'Buy credits' : 'Add demo credits'}
                <Icon name="plus" size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="section panel">
        <div className="section-heading">
          <div>
            <h2>A clear account of everything</h2>
            <p>Credit activity in this workspace.</p>
          </div>
          {live && (
            <button
              className="text-link"
              onClick={() =>
                refresh()
                  .then(() => notify('Balance refreshed.'))
                  .catch((e) => notify(e.message))
              }
            >
              Refresh balance
            </button>
          )}
        </div>
        {workspace.transactions.length ? (
          workspace.transactions.map((t) => (
            <div className="ledger-row" key={t.id}>
              <span className="run-file">
                <Icon name={t.amount > 0 ? 'plus' : 'zap'} size={17} />
              </span>
              <div>
                <strong>{t.description}</strong>
                <small>
                  {new Date(t.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </small>
              </div>
              <span className={t.amount > 0 ? 'positive' : ''}>
                {t.amount > 0 ? '+' : ''}
                {t.amount} cr
              </span>
            </div>
          ))
        ) : (
          <p className="muted">Your credit activity will appear here.</p>
        )}
      </section>
      {pack && (
        <Modal
          title={live ? 'Top up your possibilities.' : 'Try a demo top-up.'}
          onClose={() => {
            if (!busy) setPack(null);
          }}
        >
          <p className="muted">
            {live
              ? `Continue to Stripe to purchase ${pack.credits} credits for $${pack.cents / 100} USD.`
              : `Add ${pack.credits} sample credits to this browser’s demo workspace. No card or payment is involved.`}
          </p>
          <p className="fineprint">
            {live
              ? 'Credits are added after payment is confirmed. If you return before the confirmation arrives, use Refresh balance.'
              : 'Demo credits have no monetary value and cannot be transferred.'}
          </p>
          <button className="button primary full" disabled={!!busy} onClick={purchase}>
            {busy ? (
              <Icon name="loader" className="spin" size={17} />
            ) : (
              <Icon name="card" size={17} />
            )}{' '}
            {live ? 'Continue to secure checkout' : 'Add demo credits'}
          </button>
        </Modal>
      )}
    </>
  );
}
