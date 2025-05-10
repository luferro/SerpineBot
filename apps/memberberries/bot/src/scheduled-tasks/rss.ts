import { consume } from "@luferro/utils/rss";
import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";

export class RSSTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 */15 * * * *",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		await this.container.propagate("rss", async (feeds) => {
			if (!feeds || feeds.length === 0) return [];

			const data = await consume(feeds.map(({ path }) => path));
			return data.map(({ title, url }) => `${title}\n${url}`);
		});
	}
}
