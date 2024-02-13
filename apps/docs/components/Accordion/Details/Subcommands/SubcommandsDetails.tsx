import { Subcommand } from "../../../../types/bot";
import { Accordion } from "../../Accordion";

type Props = {
	id: string;
	metadata: { name: string; description?: string };
	subcommands: Subcommand[];
};

export const SubcommandsDetails = ({ id, metadata, subcommands }: Props) =>
	subcommands.map(({ name, description, options }) => (
		<Accordion
			key={`${id}.${metadata.name}.${name}`}
			id={id}
			name={`${metadata.name}.${name}`}
			description={description}
			groups={[]}
			subcommands={[]}
			options={options}
		/>
	));
