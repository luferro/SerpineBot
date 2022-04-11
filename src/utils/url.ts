import { request } from 'undici';

export const isUrl = (string: string) => {
    try {
        const url = new URL(string);
        const validProtocol = ['http:', 'https:'].some(item => item === url.protocol);
        if(!url.host && !validProtocol) return false;

        return true;
    } catch (error) {
        return false;
    }
}

export const getRedirectLocation = async (url: string | URL): Promise<string> => {
    const res = await request(url);
    const location = res.headers.location ?? url.toString();
    
    const params = new URL(location).searchParams;
    const urlSearchParam = [...params.values()].find(isUrl);
    
    return urlSearchParam
        ? await getRedirectLocation(urlSearchParam) as string
        : location;
}