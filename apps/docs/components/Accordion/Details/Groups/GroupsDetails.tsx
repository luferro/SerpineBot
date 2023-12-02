import { Group } from '../../../../types/bot';
import { Accordion } from '../../Accordion';

type Props = {
	metadata: { name: string; description?: string };
	groups: Group[];
};

export const GroupsDetails = ({ metadata, groups }: Props) =>
	groups.map(({ name, description, subcommands }, index) => (
		<Accordion
			key={index}
			name={`${metadata.name}.${name}`}
			description={description}
			groups={[]}
			subcommands={subcommands}
			options={[]}
		/>
	));
