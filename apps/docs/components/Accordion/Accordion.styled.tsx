import { Accordion, AccordionDetails, AccordionSummary, styled } from '@mui/material';

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
	'border': `1px solid ${theme.palette.divider}`,
	'&:not(:last-child)': { borderBottom: 0 },
	'marginBottom': theme.spacing(2),
}));

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
	'background': theme.palette.background.paper,
	'&:has(.Mui-expanded)': {
		'background': theme.palette.primary.main,
		'& p': { color: theme.palette.text.primary },
	},
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
	[theme.breakpoints.down('md')]: { display: 'flex', flexDirection: 'column' },
}));

export const StyledSingleAccordionDetails = styled(StyledAccordionDetails)(({ theme }) => ({
	'background': theme.palette.secondary.main,
	'display': 'flex',
	'width': '100%',
	'gap': theme.spacing(5),
	'& > div': {
		width: theme.breakpoints.down('md') ? '100%' : 0,
		flexGrow: theme.breakpoints.down('md') ? '1' : null,
	},
}));

export const StyledNestedAccordionDetails = styled(StyledAccordionDetails)(({ theme }) => ({
	'background': theme.palette.secondary.main,
	'&.MuiAccordionDetails-root > div:last-child': { marginBottom: 0 },
}));
