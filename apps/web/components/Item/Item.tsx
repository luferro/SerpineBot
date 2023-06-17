import { Accordion } from '@mantine/core';

import { Command } from '../../types/bot';
import { Control } from './Control/Control';
import { Panel } from './Panel/Panel';

export const Item = ({ commands }: { commands: Command[] }) => {
	return (
		<>
			{commands.map((command, index) => (
				<Accordion.Item key={index} value={command.name}>
					<Control name={`/${command.name}`} description={command.description} />
					<Panel command={command} />
				</Accordion.Item>
			))}
		</>
	);
};
