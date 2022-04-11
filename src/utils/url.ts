import { request } from 'undici';

export const isValid = (string: string) => {
    try {
        const url = new URL(string);
        const validProtocol = ['http:', 'https:'].some(item => item === url.protocol);

        return url.host && url.hostname && validProtocol;
    } catch (error) {
        return false;
    }
}

export const getRedirectLocation = async (url: string | URL): Promise<string> => {
    const res = await request(url);
    const location = res.headers.location ?? url.toString();
    
    const params = new URL(location).searchParams;
    const urlSearchParam = [...params.values()].find(isValid);
    
    return urlSearchParam
        ? await getRedirectLocation(urlSearchParam) as string
        : location;
}