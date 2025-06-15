import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export class PlayAutocompleteHandler extends InteractionHandler {
	constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Autocomplete,
		});
	}

	override async parse(interaction: AutocompleteInteraction) {
		if (interaction.command?.name !== "play") return this.none();

		const option = interaction.options.getFocused(true);
		if (option.value.length < 3) return this.some([]);

		const { playlist, tracks } = await this.container.player.search(option.value);
		return this.some(playlist ? [playlist] : tracks.slice(0, 10));
	}

	async run(interaction: AutocompleteInteraction, data: InteractionHandler.ParseResult<this>) {
		return interaction.respond(data.map((result) => ({ name: result.title, value: result.url })));
	}
}
