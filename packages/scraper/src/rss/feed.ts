import Parser from 'rss-parser';

const parser = new Parser();

export const getFeed = async ({ url }: { url: string }) => await parser.parseURL(url);
