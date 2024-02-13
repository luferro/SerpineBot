import { styled, Typography } from "@mui/material";

export const StyledOption = styled(Typography)(({ theme }) => ({
	padding: theme.spacing(0.5, 1),
	background: theme.palette.common.black,
	border: "1px solid transparent",
	borderRadius: 1,
}));
