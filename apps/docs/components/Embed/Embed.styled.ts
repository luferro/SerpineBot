import { Box, styled } from '@mui/material';

export const StyledEmbed = styled(Box)(({ theme }) => ({
	'boxShadow':
		'0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075)',
	'maxWidth': 516,
	'background': '#2f3136',
	'padding': '0.5rem 1rem 1rem 0.75rem',
	'borderRadius': theme.spacing(0.5),
	'& a': {
		fontSize: '1rem',
		fontWeight: 600,
		color: '#00aff4',
	},
}));

export const StyledContent = styled(Box)(({ theme }) => ({
	'width': '100%',
	'display': 'flex',
	'& > div:first-child': { flexGrow: 1 },
	'& > div': { marginRight: theme.spacing(1) },
}));

export const StyledAuthor = styled(Box)(({ theme }) => ({
	'display': 'flex',
	'fontSize': '0.875rem',
	'fontWeight': 600,
	'& img': {
		width: theme.spacing(3),
		height: theme.spacing(3),
		objectFit: 'contain',
		borderRadius: ' 50%',
		marginRight: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
}));

export const StyledTitle = styled(Box)(({ theme }) => ({
	paddingBlock: theme.spacing(1),
}));

export const StyledDescription = styled(Box)(({ theme }) => ({
	marginTop: theme.spacing(1),
}));

export const StyledFields = styled(Box)(({ theme }) => ({
	'display': 'flex',
	'flexWrap': 'wrap',
	'flexDirection': 'column',
	'gap': theme.spacing(1),
	'marginBlock': theme.spacing(1),
	'&:has(.inline-field)': { flexDirection: 'row' },
	'& .field': { width: '100%' },
	'& .inline-field ': { flexBasis: '28%' },
	'& .field, & .inline-field': {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
		fontSize: '0.875rem',
		lineHeight: '1.125rem',
		fontWeight: 400,
	},
	[theme.breakpoints.down('sm')]: { '& .field, & .inline-field': { flexBasis: '100%' } },
}));

export const StyledThumbnail = styled(Box)(({ theme }) => ({
	'marginTop': theme.spacing(1),
	'& img': { maxWidth: theme.spacing(10), maxHeight: theme.spacing(10) },
	'width': 'auto',
}));

export const StyledImage = styled(Box)(({ theme }) => ({
	'& img ': {
		maxWidth: theme.spacing(25),
		maxHeight: theme.spacing(37.5),
		width: '100%',
		display: 'block',
		aspectRatio: 200 / 300,
	},
}));
