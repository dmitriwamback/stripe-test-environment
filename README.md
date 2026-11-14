# Stripe Test Environment in Svelte

```shell
stripe listen --api-key <stripe_secret_key> --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:5173/webhook
```