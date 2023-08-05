import { StaticScraper } from '@luferro/scraper/lib';
import { UrlUtil } from '@luferro/shared-utils';

type ProviderType = 'Stream' | 'Buy' | 'Rent';

export const getProviders = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	const array = [];
	for (const element of $('.ott_provider').get()) {
		const type = $(element).find('h3').text() as ProviderType;

		const providers = $(element)
			.find('ul.providers li')
			.get()
			.filter((row) => !$(row).hasClass('hide'));

		for (const element of providers) {
			const anchor = $(element).find('a');
			const description = anchor.attr('title');
			const match = description?.match(/^\w+ (.*) on (.*)$/);
			const url = anchor.attr('href');
			if (!match || !url) continue;

			const { 1: name, 2: provider } = match;
			const destinationUrl = await UrlUtil.getRedirectLocation(url);

			array.push({
				type,
				provider,
				entry: {
					name,
					url: destinationUrl,
				},
			});
		}
	}

	return array;
};
