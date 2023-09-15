import { Resource } from 'i18next';

const getResources = async (languages: string[]) => {
	const resources: Record<string, Resource> = {};
	for (const lang of languages) {
		resources[lang] = {
			translation: {
				interactions: { ...(await import(`../locales/interactions/${lang}.json`)) },
				jobs: { ...(await import(`../locales/jobs/${lang}.json`)) },
				common: { ...(await import(`../locales/common/${lang}.json`)) },
				errors: { ...(await import(`../locales/errors/${lang}.json`)) },
			},
		};
	}
	return resources;
};

export const getInitConfig = async (lng: string) => ({
	lng,
	fallbackLng: 'en-US',
	resources: await getResources(['en-US']),
	interpolation: { escapeValue: false },
});
