import { Box, Grid, Group, Highlight, Stack, Text } from "@mantine/core";
import { SpotlightAction as MantineSpotlightAction } from "@mantine/spotlight";
import { BadgePreset } from "~/components/BadgePreset/BadgePreset";
import classes from "~/components/Spotlight/SpotlightAction/SpotlightAction.module.css";

type Props = {
	highlight: string;
	title: string;
	image?: JSX.Element | null;
	metadata?: JSX.Element | null;
	isMature?: boolean;
	onClick?: () => void;
};

export function SpotlightAction({ highlight, title, image, metadata, isMature, onClick }: Props) {
	return (
		<MantineSpotlightAction className={classes.action} onClick={onClick}>
			<Group wrap="nowrap" w="100%">
				{image && (
					<Box w={50} h="100%">
						{image}
					</Box>
				)}
				<Stack gap="xs" w="100%">
					<Grid justify="space-between" align="center" gutter="xs">
						<Grid.Col span="auto">
							<Text lineClamp={2}>
								<Highlight highlight={highlight}>{title}</Highlight>
							</Text>
						</Grid.Col>
						{!!isMature && (
							<Grid.Col span={1.3}>
								<BadgePreset type="mature" />
							</Grid.Col>
						)}
					</Grid>
					{metadata && <Group gap="xs">{metadata}</Group>}
				</Stack>
			</Group>
		</MantineSpotlightAction>
	);
}
