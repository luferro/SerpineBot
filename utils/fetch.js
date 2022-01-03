import fetch from 'node-fetch';
import UserAgent from 'user-agents';

export const fetchData = async (url, method = 'GET', body) => {
    const options = {
        method,
        headers: {
            'User-Agent': new UserAgent().toString()
        }
    }

    if(body) {
        options.headers['Content-Type'] = body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json';
        options.body = body;
    }

    const res = await fetch(url, options);
    if(!res.ok) throw new Error(`Fetching ${url} failed with status code ${res.status} - ${res.statusText}.`);

    return res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
}