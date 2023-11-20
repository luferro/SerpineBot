import { Prisma, Subscription } from '@prisma/client';

export const subscription = Prisma.defineExtension((client) => {
	return client.$extends({
		model: {
			subscription: {
				async search<T>(this: T, { query }: { query: string }) {
					const results = (await client.subscription.aggregateRaw({
						pipeline: [{ $search: { phrase: { query, path: 'catalog.title' } } }],
					})) as unknown as Subscription[];

					return results;
				},
			},
		},
	});
});
