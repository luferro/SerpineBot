import { FetchUtil } from '../';

export const isValid = (string: string) => {
	try {
		const url = new URL(string);
		const validProtocol = ['http:', 'https:'].some((item) => item === url.protocol);

		return Boolean(url.host && url.hostname && validProtocol);
	} catch (error) {
		return false;
	}
};

export const getRedirectLocation = async (url: string | URL): Promise<string> => {
	try {
		const { headers } = await FetchUtil.fetch({ url });
		const location = headers['location']?.toString();
		if (!location) return url.toString();

		const { searchParams } = new URL(location);
		const urlSearchParam = [...searchParams.values()].find(isValid);

		return urlSearchParam ? await getRedirectLocation(urlSearchParam) : location;
	} catch (error) {
		return url.toString();
	}
};
