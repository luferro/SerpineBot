import { Subcommand } from '../../../../types/bot';
import { Accordion } from '../../Accordion';

type Props = {
	metadata: { name: string; description?: string };
	subcommands: Subcommand[];
};

export const SubcommandsDetails = ({ metadata, subcommands }: Props) =>
	subcommands.map(({ name, description, options }, index) => (
		<Accordion
			key={index}
			name={`${metadata.name}.${name}`}
			description={description}
			groups={[]}
			subcommands={[]}
			options={options}
		/>
	));
