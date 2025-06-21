import { formatCurrency } from "@luferro/utils/currency";
import { toSeconds } from "@luferro/utils/time";
import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { EmbedBuilder } from "discord.js";

export class FreebiesTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 */10 * * * *",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		await this.container.propagate("freebies", async () => {
			const freebies = await this.container.gql.itad.getFreebies();
			const messages = freebies
				.slice()
				.reverse()
				.map(({ title, url, discount, regular, store, expiry }) =>
					new EmbedBuilder()
						.setTitle(title)
						.setURL(url)
						.setDescription(
							`**${discount}%** off! ~~${formatCurrency(regular.amount, { currency: regular.currency })}~~ | **Free** @ **${store}**`,
						)
						.setFooter(expiry ? { text: `Expires on <t:${toSeconds(new Date(expiry).getTime())}:f>` } : null)
						.setColor("Random"),
				);
			return { name: this.name, messages };
		});
	}
}
