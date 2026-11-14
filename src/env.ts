import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_STRIPE_PUBLISHABLE_KEY: {
		public: true,
	},
	STRIPE_SECRET_KEY: {
		public: false
	},
	WEBHOOK_SECRET: {
		public: false
	}
});