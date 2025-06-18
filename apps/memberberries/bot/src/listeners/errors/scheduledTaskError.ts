import { Listener } from "@sapphire/framework";
import type { ScheduledTask, ScheduledTaskEvents } from "@sapphire/plugin-scheduled-tasks";

export class ScheduledTaskErrorListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: ScheduledTask, _payload: unknown) {
		this.container.logger.error({
			location: task.location.full,
			pattern: String(task.pattern),
			taskName: task.name,
			message: `[TASK] ${error.message}`,
			stack: error.stack,
		});
	}
}
