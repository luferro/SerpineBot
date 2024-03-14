import type { Group } from "../../../../../types/bot";
import { Accordion } from "../../Accordion";

type Props = {
	id: string;
	metadata: { name: string; description?: string };
	groups: Group[];
};

export const GroupsDetails = ({ id, metadata, groups }: Props) =>
	groups.map(({ name, description, subcommands }) => (
		<Accordion
			key={`${id}.${metadata.name}.${name}`}
			id={id}
			name={`${metadata.name}.${name}`}
			description={description}
			groups={[]}
			subcommands={subcommands}
			options={[]}
		/>
	));
