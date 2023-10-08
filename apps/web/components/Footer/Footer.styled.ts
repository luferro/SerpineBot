import { Box, styled } from '@mui/material';

export const StyledFooter = styled(Box)(({ theme }) => ({
	width: '80%',
	margin: '20px auto 0',
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	padding: theme.spacing(2, 0),
	borderTop: `5px solid ${theme.palette.primary.main}`,
	justifyContent: 'center',
	alignItems: 'center',
	[theme.breakpoints.down('md')]: { width: '90%' },
}));
