import { request } from 'undici';
import UserAgent from 'user-agents';
import { HttpMethods } from '../types/categories';

export const fetch = async <T> (url: string | URL, method: HttpMethods = 'GET', body?: URLSearchParams | string): Promise<T> => {
    const res = await request(url, {
        method,
        headers: {
            'User-Agent': new UserAgent().toString(),
            'content-type': body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json'
        },
        body: body?.toString()
    });

    if(res.statusCode >= 400) {
        await res.body.dump();
        throw new Error(`\`${method}\` request to \`${url}\` failed. Status code: \`${res.statusCode}\`.`);
    } 

    return res.headers['content-type']?.includes('application/json')
        ? await res.body.json()
        : await res.body.text();
}