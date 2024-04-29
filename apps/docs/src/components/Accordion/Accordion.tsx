import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { Group, Option, Subcommand } from "../../types/bot";
import {
	StyledAccordion,
	StyledAccordionSummary,
	StyledNestedAccordionDetails,
	StyledSingleAccordionDetails,
} from "./Accordion.styled";
import { GroupsDetails } from "./Details/Groups/GroupsDetails";
import { OptionsDetails } from "./Details/Options/OptionsDetails";
import { SubcommandsDetails } from "./Details/Subcommands/SubcommandsDetails";

type Props = {
	id: string;
	name: string;
	description?: string;
	groups: Group[];
	subcommands: Subcommand[];
	options: Option[];
};

export function Accordion({ id, name, description, groups, subcommands, options }: Props) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const isAccordionFirstLevel = !name.includes(".");
	const hasGroups = !!groups.length;
	const hasSubcommands = !!subcommands.length;
	const hasOptions = !hasGroups && !hasSubcommands;

	const shouldDisplayDescription = !isMobile || isAccordionFirstLevel;

	return (
		<StyledAccordion slotProps={{ transition: { unmountOnExit: true } }} disableGutters>
			<StyledAccordionSummary>
				<Box display="flex" alignItems="center" gap={4}>
					<Typography fontWeight={700}>/{name.replace(/\./g, " ")}</Typography>
					{shouldDisplayDescription && (
						<Typography fontSize={14} color={(theme) => theme.palette.text.secondary}>
							{description}
						</Typography>
					)}
				</Box>
			</StyledAccordionSummary>
			{hasGroups && (
				<StyledNestedAccordionDetails>
					<GroupsDetails id={id} metadata={{ name }} groups={groups} />
				</StyledNestedAccordionDetails>
			)}
			{hasSubcommands && (
				<StyledNestedAccordionDetails>
					<SubcommandsDetails id={id} metadata={{ name }} subcommands={subcommands} />
				</StyledNestedAccordionDetails>
			)}
			{hasOptions && (
				<StyledSingleAccordionDetails>
					<OptionsDetails id={id} metadata={{ name, description }} options={options} />
				</StyledSingleAccordionDetails>
			)}
		</StyledAccordion>
	);
}
