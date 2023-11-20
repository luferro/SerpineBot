import { Resource } from 'i18next';

const getResources = async (languages: string[]) => {
	const resources: Record<string, Resource> = {};
	for (const lang of languages) {
		resources[lang] = {
			translation: {
				interactions: { ...(await import(`../locales/${lang}/interactions.json`)) },
				jobs: { ...(await import(`../locales/${lang}/jobs.json`)) },
				events: { ...(await import(`../locales/${lang}/events.json`)) },
				common: { ...(await import(`../locales/${lang}/common.json`)) },
				errors: { ...(await import(`../locales/${lang}/errors.json`)) },
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
