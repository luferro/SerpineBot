import { Accordion as MantineAccordion, createStyles, Group, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import type { Choice, Command, CommandOptions, SubcommandOptions } from '../types/response';
import styles from '../styles/Home.module.css';
import samples from '../samples.json';
import Embed from './embed';

interface Props {
	commands: Command[];
}

interface NestedProps {
	command: string;
	options: CommandOptions[];
}

interface PanelProps {
	command: string;
	description: string;
	commandOptions?: CommandOptions[];
	subcommandOptions?: SubcommandOptions[];
}

interface PopoverProps {
	name: string;
	choices: Choice[];
}

const useStyles = createStyles(() => ({
	root: { width: '100%' },
}));

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
				{choices.map(({ name }) => (
					<Text size="sm" key={name}>
						{name}
					</Text>
				))}
			</Popover.Dropdown>
		</Popover>
	);
};

const Panel = ({ command, description, commandOptions, subcommandOptions }: PanelProps) => {
	return (
		<div className={styles['panel-wrapper']}>
			<div className={styles['panel-1']}>
				<div className={styles.command}>
					<Text weight={700}>
						/{command}{' '}
						{(commandOptions ?? subcommandOptions)?.map(({ name }) => (
							<span key={name}>
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
						{commandOptions.map(({ name, description, choices, required }) => (
							<div className={styles['options-description']} key={description}>
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
						{subcommandOptions.map(({ name, description, choices, required }) => (
							<div className={styles['options-description']} key={description}>
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
					{getEmbedSample(command) ?? <Text italic>Embed sample is not available.</Text>}
				</div>
			</div>
		</div>
	);
};

const NestedAccordion = ({ command, options }: NestedProps) => {
	return (
		<>
			{options
				.filter(({ type }) => type === 1)
				.map(({ name: subcommandName, description: subcommandDescription, options: subcommandOptions }) => (
					<MantineAccordion.Item value={subcommandDescription} key={subcommandDescription}>
						<MantineAccordion.Control>
							<Group noWrap>
								<Text>{subcommandName}</Text>
								<Text size="sm" color="dimmed" weight={400} className="description">
									{subcommandDescription}
								</Text>
							</Group>
						</MantineAccordion.Control>
						<MantineAccordion.Panel>
							<Panel
								command={`${command} ${subcommandName}`}
								description={subcommandDescription}
								subcommandOptions={subcommandOptions}
							/>
						</MantineAccordion.Panel>
					</MantineAccordion.Item>
				))}
		</>
	);
};

const Accordion = ({ commands }: Props) => {
	const [value, setValue] = useState<string[]>([]);
	const { classes } = useStyles();

	return (
		<MantineAccordion
			variant="separated"
			multiple
			value={value}
			onChange={setValue}
			className={classes.root}
			classNames={{
				item: styles['accordion-item'],
				panel: styles['accordion-panel'],
				control: styles['accordion-control'],
				chevron: styles['accordion-chevron'],
			}}
		>
			{commands.map(({ name: commandName, description: commandDescription, options: commandOptions }) => (
				<MantineAccordion.Item value={commandDescription} key={commandDescription}>
					<MantineAccordion.Control className={styles['accordion-main']}>
						<Group noWrap>
							<Text>/{commandName}</Text>
							<Text size="sm" color="dimmed" weight={400} className={styles['accordion-description']}>
								{commandDescription}
							</Text>
						</Group>
					</MantineAccordion.Control>
					<MantineAccordion.Panel>
						{commandOptions.filter(({ type }) => type === 1).length > 0 ? (
							<NestedAccordion command={commandName} options={commandOptions} />
						) : (
							<Panel
								command={commandName}
								description={commandDescription}
								commandOptions={commandOptions}
							/>
						)}
					</MantineAccordion.Panel>
				</MantineAccordion.Item>
			))}
		</MantineAccordion>
	);
};

export default Accordion;
