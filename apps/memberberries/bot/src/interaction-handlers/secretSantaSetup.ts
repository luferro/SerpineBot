import { randomUUID } from "node:crypto";
import { formatCurrency } from "@luferro/utils/currency";
import { shuffle } from "@luferro/utils/data";
import { addYears, startOfDay, subYears } from "@luferro/utils/date";
import { toSeconds } from "@luferro/utils/time";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { EmbedBuilder, type User, type UserSelectMenuInteraction } from "discord.js";
import { pairings, reminders } from "~/db/schema.js";

type Participant = {
	id: string;
	user: User;
	lastYearRecipientUser?: User;
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

		const giftValueMatch = interaction.message.content.match(/\d+/g)?.[0];
		if (!giftValueMatch) throw new Error("Could not extract gift value.");
		const giftValue = Number(giftValueMatch);

		const lastYearPairings = await this.container.db.query.pairings.findMany({
			where: (pairings, { eq }) => eq(pairings.year, subYears(Date.now(), 1).getFullYear()),
		});

		const users: Participant[] = [];
		for (const userId of interaction.values) {
			const user = await this.container.client.users.fetch(userId);
			if (user.bot) throw new Error("Bots are not allowed to participate in the Secret Santa.");

			const lastYearRecipientId = lastYearPairings.find((pairing) => pairing.gifterId === user.id)?.recipientId;
			const lastYearRecipientUser = this.container.client.users.cache.find((user) => user.id === lastYearRecipientId);
			users.push({ id: randomUUID(), user, lastYearRecipientUser });
		}

		return this.some({ giftValue, users });
	}

	async run(interaction: UserSelectMenuInteraction, { giftValue, users }: InteractionHandler.ParseResult<this>) {
		await interaction.deferReply();

		const eventDate = this.getEventDate();
		const eventYear = eventDate.getFullYear();

		try {
			await this.container.db.transaction(async (tx) => {
				const shuffledUsers = shuffle(users);
				for (const [index, gifter] of shuffledUsers.entries()) {
					const recipient = shuffledUsers[index + 1] ?? shuffledUsers[0];

					const embed = new EmbedBuilder()
						.setTitle(`Secret Santa ${eventYear}? Oh, I can't wait to 'member!`)
						.setDescription(this.generateMessage(gifter, recipient))
						.addFields([
							{
								name: "How much?",
								value: formatCurrency(giftValue),
							},
							{
								name: "When?",
								value: `<t:${toSeconds(eventDate.getTime())}:F>`,
							},

							{
								name: "Who?",
								value:
									recipient.user.displayName === recipient.user.username
										? `**${recipient.user.displayName}**`
										: `**${recipient.user.displayName}** (${recipient.user.username})`,
							},
						])
						.setColor("Random");

					await gifter.user.send({ embeds: [embed] });

					await tx.insert(pairings).values({
						guildId: interaction.guild!.id,
						year: eventYear,
						gifterId: gifter.user.id,
						recipientId: recipient.user.id,
					});

					await tx.insert(reminders).values({
						userId: gifter.user.id,
						content: `Secret Santa ${eventYear}: Time to exchange gifts. 🎅 Merry christmas! 🎅`,
						dueAt: eventDate,
					});
				}
			});

			await interaction.editReply({ content: `A DM has been sent to every Secret Santa ${eventYear} participant.` });
		} catch (error) {
			this.container.logger.error("Secret Santa setup failed:", error);
			await interaction.editReply({ content: "Failed to set up Secret Santa. Ensure everyone has DMs enabled." });
		}
	}

	private getEventDate() {
		const eventDate = startOfDay(new Date(new Date().getFullYear(), 11, 25));
		return eventDate.getTime() >= Date.now() ? eventDate : addYears(eventDate, 1);
	}

	private getMessageType(
		gifter: Participant,
		recipient: Participant,
	): "SAME_RECIPIENT" | "DIFFERENT_RECIPIENT" | "NO_RECIPIENT_LAST_YEAR" {
		if (gifter.lastYearRecipientUser) {
			const isSameRecipient = gifter.lastYearRecipientUser.username === recipient.user.username;
			return isSameRecipient ? "SAME_RECIPIENT" : "DIFFERENT_RECIPIENT";
		}

		return "NO_RECIPIENT_LAST_YEAR";
	}

	private generateMessage(gifter: Participant, recipient: Participant) {
		const type = this.getMessageType(gifter, recipient);

		const presets: Record<typeof type, string[]> = {
			SAME_RECIPIENT: [
				`'Member last year when you gifted ${recipient.user.username}? Well, guess what? You're gifting to them again! Let's make this one even more 'memberable!`,
				`Oh, I 'member! You gifted ${recipient.user.username} last year! They must've loved it because you got them again! Time to make more 'memories!`,
				`'Member gifting to ${recipient.user.username} last year? Yeah, I 'member! Lightning strikes twice - you got them again! Make it twice as 'memberable!`,
				`Ooh, I 'member ${recipient.user.username} from last year! Looks like fate wants you two to 'member this tradition together. Let's go!`,
				`Wait, 'member last year with ${recipient.user.username}? You're getting them AGAIN?! This is destiny! Double the 'membering, double the fun!`,
				`I 'member! I 'member ${recipient.user.username}! They're back for round two! Show them why they're worth 'membering twice!`,
				`'Member that special gift for ${recipient.user.username} last year? Time for the sequel! Let's make Secret Santa 2: Even More 'Memberable!`,
				`You and ${recipient.user.username}? Again?! Oh, I love it! This is a 'memberberry match made in heaven! Make it legendary!`,
			],
			DIFFERENT_RECIPIENT: [
				`'Member last year when you gifted ${gifter.lastYearRecipientUser?.username}? Well, it's that time of year again! This time, you're gifting to ${recipient.user.username}. Let's make this one 'memberable!`,
				`Oh yeah, I 'member! You gifted ${gifter.lastYearRecipientUser?.username} last year! Now it's ${recipient.user.username}'s turn to receive your awesome gift. 'Member to make it special!`,
				`'Member the good times gifting ${gifter.lastYearRecipientUser?.username}? This year, ${recipient.user.username} gets to experience your gift-giving magic. Let's create new 'memories!`,
				`I 'member last year with ${gifter.lastYearRecipientUser?.username}! But this year's a fresh start with ${recipient.user.username}. Time to make it 'memberable!`,
				`Ooh, 'member gifting to ${gifter.lastYearRecipientUser?.username}? That was great! Now let's see what magic you can work for ${recipient.user.username} this year!`,
				`Last year was ${gifter.lastYearRecipientUser?.username}, I 'member it well! This year? It's all about ${recipient.user.username}! New person, new 'memories!`,
				`'Member how amazing ${gifter.lastYearRecipientUser?.username}'s gift was? Yeah! Now it's ${recipient.user.username}'s turn to be amazed. Let's make it 'memberable!`,
				`Oh, I 'member ${gifter.lastYearRecipientUser?.username} from last year! But change is good! ${recipient.user.username} is ready for your gift-giving expertise!`,
			],
			NO_RECIPIENT_LAST_YEAR: [
				`Oh wow, it's your first time gifting! This year, you're starting strong by gifting to ${recipient.user.username}. Let's make this one truly 'memberable!`,
				`'Member when you joined Secret Santa? This is it! You're gifting to ${recipient.user.username} - let's create some 'memories worth 'membering!`,
				`Your first Secret Santa! I'm so excited I could burst! You got ${recipient.user.username} - make it a gift they'll always 'member!`,
				`Ooh, a Secret Santa rookie! Don't worry, gifting to ${recipient.user.username} is gonna be 'memberable! Let's make this first time special!`,
				`First time's the charm! You're gifting to ${recipient.user.username} and I just know it's gonna be amazing. Time to make 'memories!`,
				`Welcome to Secret Santa! Your first recipient is ${recipient.user.username}! This is the beginning of something 'memberable!`,
				`It's your Secret Santa debut! You're paired with ${recipient.user.username}! Make it so good they'll 'member it forever!`,
				`Ooh ooh! First timer here! You got ${recipient.user.username}! No pressure, but let's make this the most 'memberable first gift ever!`,
			],
		};

		return shuffle(presets[type])[0];
	}
}
