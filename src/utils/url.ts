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

export const getRedirectLocation = async (url: string | URL) => {
    const res = await request(url);
    return res.headers.location ?? url.toString();
}