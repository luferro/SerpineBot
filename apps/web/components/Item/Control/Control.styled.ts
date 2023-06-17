import styled from '@emotion/styled';
import { Accordion } from '@mantine/core';

export const StyledControl = styled(Accordion.Control)`
	@media (max-width: 600px) {
		& .mantine-Group-root :last-child {
			display: none;
		}
	}
`;
