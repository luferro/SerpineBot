import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export class DealsAutocompleteHandler extends InteractionHandler {
	constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Autocomplete,
		});
	}

	override async parse(interaction: AutocompleteInteraction) {
		if (interaction.command?.name !== "deals") return this.none();

		const option = interaction.options.getFocused(true);
		if (option.value.length < 3) return this.none();

		const results = await this.container.gql.itad.search({ query: option.value });
		return this.some(results.slice(0, 10));
	}

	async run(interaction: AutocompleteInteraction, results: InteractionHandler.ParseResult<this>) {
		return interaction.respond(results.map((result) => ({ name: result.title, value: result.id })));
	}
}
