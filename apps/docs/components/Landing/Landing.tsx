import { Typography } from '@mui/material';
import parse from 'html-react-parser';
import { marked } from 'marked';

import { StyledLanding } from './Landing.styles';

type Props = { title: string; description: string };

export const Landing = ({ title, description }: Props) => (
	<StyledLanding>
		<Typography component={'span'} fontSize={24}>
			{parse(marked.parse(title))}
		</Typography>
		<br />
		<Typography component={'span'} color={(theme) => theme.palette.text.secondary}>
			{parse(marked.parse(description))}
		</Typography>
	</StyledLanding>
);
