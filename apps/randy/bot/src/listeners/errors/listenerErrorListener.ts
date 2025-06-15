import { type Events, Listener, type ListenerErrorPayload } from "@sapphire/framework";

export class ListenerErrorListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, { piece }: ListenerErrorPayload) {
		this.container.logger.error({
			location: piece.location.full,
			event: String(piece.event),
			once: piece.once,
			pieceName: piece.name,
			message: `[LISTENER] ${error.message}`,
			stack: error.stack,
		});
	}
}
