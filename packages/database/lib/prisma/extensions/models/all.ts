import { Prisma } from '@prisma/client';

export const all = Prisma.defineExtension((client) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getContext = <T>(that: T) => Prisma.getExtensionContext(that) as any;

	return client.$extends({
		model: {
			$allModels: {
				async exists<T>(this: T, where: Pick<Prisma.Args<T, 'count'>, 'where'>) {
					const count = await getContext(this).count({ where });
					return count > 0;
				},
			},
		},
	});
});
