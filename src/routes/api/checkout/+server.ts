import { json } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY } from '$app/env/private';
import Stripe from 'stripe';

export async function POST({ request }) {

    if (!STRIPE_SECRET_KEY) {
        return json({ error: 'Stripe secret key is not set' }, { status: 500 });
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const body = await request.json();
        const action = body.action;

        if (!action) {
            return json({ error: 'Invalid action' }, { status: 400 });
        }

        if (action !== 'some-action') {
            return json({ error: 'Action does not meet criteria' }, { status: 400 });
        }

        const amount = 5 * 100; // 5 cents * 100 => 5$ (usd)

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded_page',
            mode: 'payment',

            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Test Product',
                    },
                    unit_amount: amount,
                },
                quantity: 1
            }],

            metadata: {
                action: action,
                sample_metadata: '10'
            },

            return_url: 'http://localhost:5173/payment-return?session_id={CHECKOUT_SESSION_ID}',
            redirect_on_completion: 'if_required'
        });

        return json({ clientSecret: session.client_secret });

    } 
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        console.error('Checkout session failed:', error);
        return json({ error: message }, { status: 500 });
    }
}