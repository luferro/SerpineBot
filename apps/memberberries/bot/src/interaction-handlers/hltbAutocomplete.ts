import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export class HowLongToBeatAutocompleteHandler extends InteractionHandler {
	constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Autocomplete,
		});
	}

	override async parse(interaction: AutocompleteInteraction) {
		if (interaction.command?.name !== "hltb") return this.none();

		const option = interaction.options.getFocused(true);
		if (option.value.length < 3) return this.none();

		const results = await this.container.gql.hltb.search({ query: option.value });
		return this.some(results.slice(0, 10));
	}

	async run(interaction: AutocompleteInteraction, results: InteractionHandler.ParseResult<this>) {
		return interaction.respond(
			results.map((result) => {
				const occurrences = results.reduce((acc, el) => acc + (el.title === result.title ? 1 : 0), 0);
				return {
					name: occurrences >= 2 ? `${result.title} (${result.releaseYear})` : result.title,
					value: result.id,
				};
			}),
		);
	}
}
