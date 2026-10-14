import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/server';
import { creditPacks } from '@/lib/billing';
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const pack = creditPacks.find((p) => p.id === session.metadata?.pack_id);
    const userId = session.metadata?.user_id;
    if (session.payment_status !== 'paid') return NextResponse.json({ received: true });
    if (
      !pack ||
      !userId ||
      session.client_reference_id !== userId ||
      session.currency !== 'usd' ||
      session.amount_total !== pack.cents
    )
      return NextResponse.json({ error: 'Payment metadata mismatch.' }, { status: 400 });
    try {
      const { error } = await adminDb().rpc('credit_purchase', {
        p_user_id: userId,
        p_session_id: session.id,
        p_credits: pack.credits,
        p_description: `Credit purchase · ${pack.credits} credits`,
      });
      if (error) throw error;
    } catch {
      return NextResponse.json(
        { error: 'Payment recorded by Stripe; credit fulfillment will retry.' },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ received: true });
}
