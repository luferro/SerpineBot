import { Feed, getPlaystationFeed } from './playstation.feed';

type Blog = { blog: keyof typeof Feed };

export const getBlog = async ({ blog }: Blog) => await getPlaystationFeed({ url: Feed[blog] });
