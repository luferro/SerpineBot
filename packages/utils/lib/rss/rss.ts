import { isToday } from "date-fns";
import Parser from "rss-parser";

const parser = new Parser();

async function parse(url: string) {
	try {
		return await parser.parseURL(url);
	} catch (error) {
		return null;
	}
}

export async function consume(feeds: string[]) {
	const data = [];
	for (const feed of feeds) {
		const output = await parse(feed);
		if (!output) continue;

		const items = output.items
			.filter(({ isoDate }) => isoDate && isToday(isoDate))
			.map(
				({
					creator,
					categories,
					title,
					link,
					content,
					"content:encoded": encodedContent,
					contentSnippet,
					isoDate,
				}) => ({
					creator: creator ?? null,
					categories: categories ?? [],
					title: title!,
					url: link!,
					description: contentSnippet!,
					content: encodedContent ?? content,
					publishedAt: isoDate ? new Date(isoDate) : new Date(),
				}),
			);

		data.push(...items);
	}

	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
