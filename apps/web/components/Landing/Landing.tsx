import { Text } from '@mantine/core';
import parse from 'html-react-parser';
import { marked } from 'marked';

import { StyledLanding } from './Landing.styles';

export const Landing = ({ title, description }: { title: string; description: string }) => {
	return (
		<StyledLanding>
			<Text size="xl">{parse(marked.parse(title))}</Text>
			<Text size="md" color="dimmed">
				{parse(marked.parse(description))}
			</Text>
		</StyledLanding>
	);
};
