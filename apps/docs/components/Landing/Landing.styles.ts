import { Box, styled } from "@mui/material";

export const StyledLanding = styled(Box)(({ theme }) => ({
	width: "100%",
	background: theme.palette.background.paper,
	borderBottom: `5px solid ${theme.palette.primary.main}`,
	padding: theme.spacing(2),
	marginBottom: theme.spacing(2.5),
	"& a": {
		fontWeight: 700,
		color: "#00aff4",
	},
}));
