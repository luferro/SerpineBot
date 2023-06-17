import styled from '@emotion/styled';
import { Accordion } from '@mantine/core';

export const StyledAccordion = styled(Accordion)`
	& .mantine-Accordion-item {
		border: none;
		background: none;
	}
	& .mantine-Accordion-chevron {
		color: #fff;
	}
	.mantine-Accordion-control {
		background: #202225;
	}
	& .mantine-Accordion-control[data-active='true'] {
		background: #5865f2;
		& .mantine-Text-root:last-child {
			color: #ddd;
		}
	}
	& .mantine-Accordion-panel {
		background: #292b2f;
	}
`;
