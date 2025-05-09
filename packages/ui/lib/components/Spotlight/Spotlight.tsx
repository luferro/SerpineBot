"use client";

import { ActionIcon, Button, Kbd, Text } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { Spotlight as MantineSpotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import classes from "~/components/Spotlight/Spotlight.module.css";
import { SpotlightAction } from "~/components/Spotlight/SpotlightAction/SpotlightAction";
import { SpotlightEmpty } from "~/components/Spotlight/SpotlightEmpty/SpotlightEmpty";
import { SpotlightLoader } from "~/components/Spotlight/SpotlightLoader/SpotlightLoader";

type Action = {
	highlight: string;
	id: number;
	title: string;
	image?: JSX.Element | null;
	metadata?: JSX.Element | null;
	isMature?: boolean;
	onClick?: () => void;
};

type Props = {
	isLoading: boolean;
	isEmpty: boolean;
	data: { label: string; actions: Action[] }[];
	setQuery: React.Dispatch<React.SetStateAction<string>>;
};

export function Spotlight({ isLoading, isEmpty, data, setQuery }: Props) {
	const os = useOs();

	return (
		<>
			<Button
				className={classes.button}
				w={300}
				radius="md"
				justify="space-between"
				leftSection={
					<>
						<IconSearch color="var(--mantine-color-dimmed)" />
						<Text pl={10} c={"var(--mantine-color-dimmed)"}>
							Search
						</Text>
					</>
				}
				rightSection={
					<>
						<Kbd>{os === "macos" ? "⌘" : "Ctrl"}</Kbd>&nbsp;+&nbsp;<Kbd>K</Kbd>
					</>
				}
				onClick={spotlight.open}
				variant="default"
				visibleFrom="md"
			/>
			<ActionIcon className={classes.button} size="lg" onClick={spotlight.open} variant="default" hiddenFrom="md">
				<IconSearch color="var(--mantine-color-dimmed)" />
			</ActionIcon>
			<MantineSpotlight.Root onQueryChange={setQuery} scrollable maxHeight="100%">
				<MantineSpotlight.Search placeholder="Search..." leftSection={<IconSearch />} />
				<MantineSpotlight.ActionsList>
					{isLoading && <SpotlightLoader />}
					{isEmpty && <SpotlightEmpty />}
					{data.map(({ label, actions }) => (
						<MantineSpotlight.ActionsGroup key={label} className={classes["actions-group"]} label={label}>
							{actions.map(({ id, ...rest }) => (
								<SpotlightAction key={id} {...rest} />
							))}
						</MantineSpotlight.ActionsGroup>
					))}
				</MantineSpotlight.ActionsList>
			</MantineSpotlight.Root>
		</>
	);
}
