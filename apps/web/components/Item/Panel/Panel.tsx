import { Accordion, Box, Text } from '@mantine/core';

import { Command, Group, Option, Subcommand } from '../../../types/bot';
import { Embed } from '../../Embed/Embed';
import { Control } from '../Control/Control';
import { StyledCommand, StyledOption, StyledOptionsList, StyledPanel } from './Panel.styled';

type Metadata = { name: string; description?: string };

export const Panel = ({ command: { name, description, groups, subcommands, options } }: { command: Command }) => {
	const getOptionsPanel = (metadata: Metadata, options: Option[]) => {
		return (
			<StyledPanel>
				<Box>
					<Box>
						<StyledCommand>
							<Text weight={700}>/{metadata.name.replace(/\./g, ' ')}</Text>
							{options?.map((option, index) => (
								<StyledOption key={index}>
									<Text>{option.name}</Text>
								</StyledOption>
							))}
						</StyledCommand>
						<Text size="sm" italic>
							{metadata.description}
						</Text>
					</Box>
					{!!options.length && (
						<StyledOptionsList>
							<Text weight={700}>Command options</Text>
							{options.map((option, index) => (
								<StyledOption key={index}>
									<Text>{option.name}</Text>
									<Text>{option.description}</Text>
									{option.required && <Text color="#ff3131">*</Text>}
								</StyledOption>
							))}
							{options.some((option) => option.required) && <Text color="#ff3131">* Required.</Text>}
						</StyledOptionsList>
					)}
				</Box>
				<Box>
					<Text weight={700}>Embed sample</Text>
					<Embed name={metadata.name} />
				</Box>
			</StyledPanel>
		);
	};

	const getSubcommandsPanel = (metadata: Metadata, subcommands: Subcommand[]) => {
		return (
			<>
				{subcommands.map((subcommand, index) => {
					const name = `${metadata.name}.${subcommand.name}`;
					return (
						<Accordion.Item key={index} value={name}>
							<Control name={subcommand.name} description={subcommand.description} />
							<Accordion.Panel>
								{getOptionsPanel({ name, description: subcommand.description }, subcommand.options)}
							</Accordion.Panel>
						</Accordion.Item>
					);
				})}
			</>
		);
	};

	const getGroupsPanel = (metadata: Metadata, groups: Group[]) => {
		return (
			<>
				{groups.map((group, index) => {
					const name = `${metadata.name}.${group.name}`;
					return (
						<Accordion.Item key={index} value={name}>
							<Control name={group.name} description={group.description} />
							<Accordion.Panel>
								{getSubcommandsPanel({ name, description: group.description }, group.subcommands)}
							</Accordion.Panel>
						</Accordion.Item>
					);
				})}
			</>
		);
	};

	return (
		<Accordion.Panel>
			{!!groups.length && getGroupsPanel({ name }, groups)}
			{!!subcommands.length && getSubcommandsPanel({ name }, subcommands)}
			{!groups.length && !subcommands.length && getOptionsPanel({ name, description }, options)}
		</Accordion.Panel>
	);
};
