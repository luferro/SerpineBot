import { Group, Text } from '@mantine/core';

import { StyledControl } from './Control.styled';

export const Control = ({ name, description }: { name: string; description: string }) => {
	return (
		<StyledControl>
			<Group noWrap>
				<Text color="#fff">{name}</Text>
				<Text size="sm" color="dimmed" weight={400}>
					{description}
				</Text>
			</Group>
		</StyledControl>
	);
};
