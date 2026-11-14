import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, WEBHOOK_SECRET } from '$app/env/private';
import { env } from 'process';

export async function POST({ request }) {

    if (!STRIPE_SECRET_KEY || !WEBHOOK_SECRET) {
        return json({ error: 'Stripe secret key or webhook secret is not set' }, { status: 500 });
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } 
    catch (err) {
        return json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
        return json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
        return json({ received: true });
    }

    const sampleMetadata = session.metadata?.sample_metadata;
    const action = session.metadata?.action;

    if (!sampleMetadata || !action) {
        return json({ error: 'Missing metadata in session' }, { status: 400 });
    }

    // Process the payment and perform any necessary actions based on the metadata
    // For example, you can update your database, send a confirmation email, etc.
}