import { Skeleton, styled } from '@mui/material';

export const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
	'maxWidth': '100%',
	'&::before': { background: theme.palette.secondary.main },
	'&::after': { background: theme.palette.background.paper },
}));
