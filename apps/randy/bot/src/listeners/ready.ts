import { Events, Listener } from "@sapphire/framework";

export class ReadyListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.ClientReady,
		});
	}

	public async run() {
		this.container.logger.info("Bot | Ready to process interactions");
	}
}
