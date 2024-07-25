import { formatCurrency } from "@luferro/helpers/currency";
import { formatDate } from "@luferro/helpers/datetime";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import { FeedType } from "~/structures/Database.js";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const localization = client.getLocalization();

	const messages = [];
	const freebies = await client.api.gaming.games.deals.getFreebies();
	for (const { title, url, discount, regular, store, expiry } of freebies.reverse()) {
		const { amount, currency } = regular;

		const footerText = expiry
			? t("jobs.gaming.deals.free.embed.footer.text", { expiry: formatDate(expiry, localization) })
			: null;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(
				t("jobs.gaming.deals.free.embed.description", {
					store,
					discount,
					regular: formatCurrency(amount, { currency, ...localization }),
				}),
			)
			.setFooter(footerText ? { text: footerText } : null)
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: FeedType.FREEBIES, messages });
};
