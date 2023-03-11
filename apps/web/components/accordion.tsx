import { Accordion as MantineAccordion, createStyles, Group, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';

import samples from '../samples.json';
import styles from '../styles/Home.module.css';
import type { Choice, Command, CommandOptions, SubcommandOptions } from '../types/response';
import Embed from './embed';

interface Props {
	commands: Command[];
}

interface NestedProps {
	commandName: string;
	commandOptions: CommandOptions[];
}

interface PanelProps {
	commandName: string;
	description: string;
	commandOptions?: CommandOptions[];
	subcommandOptions?: SubcommandOptions[];
}

interface PopoverProps {
	name: string;
	choices: Choice[];
}

const useStyles = createStyles(() => ({ root: { width: '100%' } }));

const getEmbedSample = (name: string) => {
	const sample = Object.entries(samples).find(([key]) => key === name.replace(' ', '.'));
	if (!sample) return;

	const {
		1: { author, description, fields, image, thumbnail, title, url },
	} = sample;

	return (
		<Embed
			author={author}
			title={title}
			description={description}
			url={url}
			thumbnail={thumbnail}
			image={image}
			fields={fields}
		/>
	);
};

const ChoicesPopover = ({ name, choices }: PopoverProps) => {
	const [opened, { close, open }] = useDisclosure(false);

	return (
		<Popover opened={opened} width={200} position="bottom" withArrow styles={{ dropdown: { color: '#000' } }}>
			<Popover.Target>
				<span onMouseEnter={open} onMouseLeave={close} className={styles.pill} style={{ cursor: 'pointer' }}>
					{name}
				</span>
			</Popover.Target>
			<Popover.Dropdown>
				<Text size="lg" italic>
					Available choices
				</Text>
				{choices.map(({ name }, index) => (
					<Text size="sm" key={index}>
						{name}
					</Text>
				))}
			</Popover.Dropdown>
		</Popover>
	);
};

const Panel = ({ commandName, description, commandOptions, subcommandOptions }: PanelProps) => {
	return (
		<div className={styles['panel-wrapper']}>
			<div className={styles['panel-1']}>
				<div className={styles.command}>
					<Text weight={700}>
						/{commandName}{' '}
						{(commandOptions ?? subcommandOptions)?.map(({ name }, index) => (
							<span key={index}>
								<span className={styles.pill}>{name}</span>
								&nbsp;
							</span>
						))}
					</Text>
					<Text size="sm" italic>
						{description}
					</Text>
				</div>

				{commandOptions && commandOptions.length > 0 ? (
					<div className={styles.options}>
						<Text weight={700}>Command options</Text>
						{commandOptions.map(({ name, description, choices, required }, index) => (
							<div className={styles['options-description']} key={index}>
								{choices?.length > 0 ? (
									<ChoicesPopover name={name} choices={choices} />
								) : (
									<span className={styles.pill}>{name}</span>
								)}
								{' - '}
								{description} {required ? <span style={{ color: '#ff3131' }}>*</span> : ''}{' '}
							</div>
						))}
						<p>
							<span style={{ color: '#ff3131' }}>*</span> Required.
						</p>
					</div>
				) : (
					''
				)}

				{subcommandOptions && subcommandOptions.length > 0 ? (
					<div className={styles.options}>
						<Text weight={700}>Command options</Text>
						{subcommandOptions.map(({ name, description, choices, required }, index) => (
							<div className={styles['options-description']} key={index}>
								{choices?.length > 0 ? (
									<ChoicesPopover name={name} choices={choices} />
								) : (
									<span className={styles.pill}>{name}</span>
								)}
								{' - '}
								{description} {required ? <span style={{ color: '#ff3131' }}>*</span> : ''}
							</div>
						))}
						<p>
							<span style={{ color: '#ff3131' }}>*</span> Required.
						</p>
					</div>
				) : (
					''
				)}
			</div>
			<div className={styles['panel-2']}>
				<div className={styles['sample']}>
					<Text weight={700}>Embed sample</Text>
				</div>
				<div className={styles['embed-sample']}>
					{getEmbedSample(commandName) ?? <Text italic>Embed sample is not available.</Text>}
				</div>
			</div>
		</div>
	);
};

const NestedAccordion = ({ commandName, commandOptions }: NestedProps) => {
	return (
		<>
			{commandOptions
				.filter(({ type }) => type === 1)
				.map(({ name, description, options }, index) => (
					<MantineAccordion.Item value={`${commandName} ${name}`} key={index}>
						<MantineAccordion.Control>
							<Group noWrap>
								<Text>{name}</Text>
								<Text size="sm" color="dimmed" weight={400} className={styles['accordion-description']}>
									{description}
								</Text>
							</Group>
						</MantineAccordion.Control>
						<MantineAccordion.Panel>
							<Panel
								commandName={`${commandName} ${name}`}
								description={description}
								subcommandOptions={options}
							/>
						</MantineAccordion.Panel>
					</MantineAccordion.Item>
				))}
		</>
	);
};

const Accordion = ({ commands }: Props) => {
	const { classes } = useStyles();

	const [state, setState] = useState<string[]>([]);

	const getAccordionChildren = (commandName: string, description: string, options: CommandOptions[]) => {
		if (!state.includes(commandName)) return 'Loading...';

		const hasSubcommands = options.filter(({ type }) => type === 1).length > 0;
		if (hasSubcommands) return <NestedAccordion commandName={commandName} commandOptions={options} />;

		return <Panel commandName={commandName} description={description} commandOptions={options} />;
	};

	return (
		<MantineAccordion
			variant="separated"
			multiple
			value={state}
			onChange={setState}
			className={classes.root}
			classNames={{
				item: styles['accordion-item'],
				panel: styles['accordion-panel'],
				control: styles['accordion-control'],
				chevron: styles['accordion-chevron'],
			}}
		>
			{commands.map(({ name, description, options }, index) => (
				<MantineAccordion.Item value={name} key={index}>
					<MantineAccordion.Control className={styles['accordion-main']}>
						<Group noWrap>
							<Text>/{name}</Text>
							<Text size="sm" color="dimmed" weight={400} className={styles['accordion-description']}>
								{description}
							</Text>
						</Group>
					</MantineAccordion.Control>
					<MantineAccordion.Panel>{getAccordionChildren(name, description, options)}</MantineAccordion.Panel>
				</MantineAccordion.Item>
			))}
		</MantineAccordion>
	);
};

export default Accordion;
