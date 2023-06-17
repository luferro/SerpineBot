import { Accordion, Group, Text } from '@mantine/core';

export const Control = ({ name, description }: { name: string; description: string }) => {
	return (
		<Accordion.Control>
			<Group noWrap>
				<Text color="#fff">{name}</Text>
				<Text size="sm" color="dimmed" weight={400}>
					{description}
				</Text>
			</Group>
		</Accordion.Control>
	);
};
