import { Listener, container } from "@sapphire/framework";
import { type GuildQueue, GuildQueueEvent } from "discord-player";

export class QueueErrorListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.player.events,
			event: GuildQueueEvent.Error,
		});
	}

	public run(_queue: GuildQueue, error: Error) {
		this.container.logger.error(error);
	}
}
