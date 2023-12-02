import { Box, styled } from '@mui/material';

export const StyledMain = styled(Box)(({ theme }) => ({
	margin: '20px auto 0',
	width: '80%',
	[theme.breakpoints.down('md')]: { width: '95%' },
}));
