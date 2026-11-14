<script lang="ts">
    import { loadStripe } from '@stripe/stripe-js';
    import { onMount, onDestroy, tick } from 'svelte';
    import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$app/env/public';

    let stripePromise: any;
    let modalOpen = $state(false);
    let checkoutLoading = $state(false);
    let checkoutCompleted = $state(false);

    let checkoutElement = $state<HTMLDivElement | undefined>(undefined);

    type EmbeddedCheckout = {
        mount: (element: HTMLElement) => void;
        unmount: () => void;
        destroy: () => void;
    }

    let checkoutInstance: EmbeddedCheckout | null = null;

    onMount(async () => {
        stripePromise = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
    });

    async function openCheckout() {

        checkoutCompleted = false;

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    action: 'some-action',
                    some_value: 0
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (!data.clientSecret) {
                throw new Error('No client secret returned from the server');
            }

            modalOpen = true;
            checkoutLoading = true;

            await tick();

            const stripe = await stripePromise;

            if (!stripe) {
                throw new Error('Stripe.js failed to load');
            }

            const checkout = await stripe.createEmbeddedCheckoutPage({
                clientSecret: data.clientSecret,
                onComplete: () => {
                    console.log('Checkout completed successfully');
                    closeCheckout();
                }
            });

            if (!modalOpen) {
                checkout.destroy();
                return;
            }

            checkoutInstance = checkout;
            checkoutInstance.mount(checkoutElement!);
            checkoutLoading = false;
        }
        catch (error) {
            console.error('Error opening checkout:', error);
            closeCheckout();
        }
    }

    function closeCheckout() {
        modalOpen = false;
        checkoutLoading = false;
        
        if (checkoutInstance) {
            checkoutInstance.unmount();
            checkoutInstance.destroy();
            checkoutInstance = null;
        }
    }
</script>

<button onclick={() => openCheckout()}>Test</button>

{#if modalOpen}
    <div class="checkout-backdrop">
        <div class="checkout-modal" role="dialog" aria-modal="true" aria-label="Secure Payment">
            <div class="checkout-modal-header">
                <h2>Secure Payment</h2>
                <button class="close-button" onclick={() => closeCheckout()} aria-label="Close">X</button>
            </div>

            {#if checkoutLoading}
                <div class="checkout-loading">
                    <p>Loading checkout...</p>
                </div>
            {/if}

            <div class="checkout-container" bind:this={checkoutElement}></div>
        </div>
    </div>
{/if}