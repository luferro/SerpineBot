import { randomUUID } from "node:crypto";
import { formatCurrency } from "@luferro/utils/currency";
import { shuffle } from "@luferro/utils/data";
import { addYears, startOfDay } from "@luferro/utils/date";
import { toSeconds } from "@luferro/utils/time";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { EmbedBuilder, type User, type UserSelectMenuInteraction } from "discord.js";
import { pairings, reminders } from "~/db/schema.js";

type Participant = {
	id: string;
	user: User;
	lastYearRecipient?: User;
};

export class SecretSantaSetupHandler extends InteractionHandler {
	constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.SelectMenu,
		});
	}

	override async parse(interaction: UserSelectMenuInteraction) {
		if (interaction.customId !== "secret-santa-setup") return this.none();

		const date = this.getEventDate();
		const lastYearPairings = await this.container.db.query.pairings.findMany({
			where: (pairings, { eq }) => eq(pairings.year, date.getFullYear()),
		});

		const users: Participant[] = [];
		for (const userId of interaction.values) {
			const user = await this.container.client.users.fetch(userId);
			if (user.bot) throw new Error("Bots are not allowed to participate in the Secret Santa.");

			const lastYearRecipientId = lastYearPairings.find((pairing) => pairing.gifterId === user.id)?.recipientId;
			const lastYearRecipient = this.container.client.users.cache.find((user) => user.id === lastYearRecipientId);
			users.push({ id: randomUUID(), user, lastYearRecipient });
		}

		return this.some({ date, users });
	}

	async run(interaction: UserSelectMenuInteraction, { date, users }: InteractionHandler.ParseResult<this>) {
		const giftValue = Number(interaction.message.content.match(/\d+/g)![0]);

		const shuffledUsers = shuffle(users);
		for (const [index, gifter] of shuffledUsers.entries()) {
			const recipient = shuffledUsers[index + 1] ?? shuffledUsers[0];

			const embed = new EmbedBuilder()
				.setTitle(`Secret Santa ${date.getFullYear()}? Oh, I can't wait to 'member!`)
				.setDescription(this.createSecretSantaMessage(gifter, recipient))
				.addFields([
					{
						name: "How much?",
						value: formatCurrency(giftValue),
					},
					{
						name: "When?",
						value: `<t:${toSeconds(date.getTime())}:F>`,
					},

					{
						name: "Who?",
						value: `**${recipient.user.displayName}** (${recipient.user.username})`,
					},
				])
				.setColor("Random");

			await gifter.user.send({ embeds: [embed] });

			await this.container.db.insert(pairings).values({
				guildId: interaction.guild!.id,
				year: date.getFullYear(),
				gifterId: gifter.user.id,
				recipientId: recipient.user.id,
			});

			await this.container.db.insert(reminders).values({
				userId: gifter.user.id,
				content: `Secret Santa ${date.getFullYear()}: Time to exchange gifts. 🎅 Merry christmas! 🎅`,
				dueAt: date,
			});
		}
	}

	private createSecretSantaMessage(gifter: Participant, recipient: Participant) {
		return gifter.lastYearRecipient
			? `'Member last year when you gifted ${gifter.lastYearRecipient.username} that awesome gift? ${
					gifter.lastYearRecipient.username === recipient.user.username
						? `Well, guess what? You're gifting to ${recipient.user.username} again this year! Let's make this one even more 'memberable!`
						: `Well, it's that time of year again! This time, you're gifting to ${recipient.user.username}. Let's make this one 'memberable!`
				}`
			: `Oh wow, it's your first time gifting! This year, you're starting strong by gifting to ${recipient.user.username}. Let’s make this one truly 'memberable!`;
	}

	private getEventDate() {
		const eventDate = startOfDay(new Date(new Date().getFullYear(), 11, 25));
		return eventDate.getTime() >= Date.now() ? eventDate : addYears(eventDate, 1);
	}
}
