import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { authenticate, fail, readJson, ApiError } from '@/lib/server';
import { creditPacks } from '@/lib/billing';
export async function POST(request: Request) {
  try {
    const { user } = await authenticate(request);
    const { packId } = z.object({ packId: z.string() }).parse(await readJson(request));
    const pack = creditPacks.find((p) => p.id === packId);
    if (!pack) throw new ApiError('Choose a valid credit pack.');
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_WEBHOOK_SECRET ||
      !process.env.APP_URL
    )
      throw new ApiError('Payments are not connected yet. No charge has been made.', 503);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = new URL(process.env.APP_URL).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, pack_id: pack.id },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pack.cents,
            product_data: { name: `Promptly · ${pack.credits} credits` },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing?payment=success`,
      cancel_url: `${origin}/billing?payment=cancelled`,
    });
    if (!session.url) throw new Error('Checkout did not return a URL.');
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return fail(e);
  }
}
