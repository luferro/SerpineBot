import Parser from 'rss-parser';

type Url = { url: string };

const parser = new Parser();

export const getFeed = async ({ url }: Url) => await parser.parseURL(url);
