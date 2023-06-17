import { Command } from '../../types/bot';
import { Item } from '../Item/Item';
import { StyledAccordion } from './Accordion.styled';

export const Accordion = ({ commands }: { commands: Command[] }) => {
	return (
		<StyledAccordion variant="separated" multiple>
			<Item commands={commands} />
		</StyledAccordion>
	);
};
