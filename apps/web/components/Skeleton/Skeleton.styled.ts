import styled from '@emotion/styled';
import { Skeleton } from '@mantine/core';

export const StyledSkeleton = styled(Skeleton)`
	&::before {
		background: #292b2f;
	}
	&::after {
		background: #202225;
	}
`;
