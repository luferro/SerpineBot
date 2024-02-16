import FavoriteIcon from "@mui/icons-material/Favorite";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Box, Typography } from "@mui/material";

import { StyledFooter } from "./Footer.styled";

export const Footer = () => (
	<StyledFooter>
		<Typography display="flex" alignItems="center">
			Made with&nbsp;
			<FavoriteIcon sx={{ fill: "red" }} />
			&nbsp;in Portugal
		</Typography>
		<Box>
			<a href="https://github.com/luferro" target="_blank" rel="noopener noreferrer">
				<LinkedInIcon sx={{ fill: (theme) => theme.palette.common.white, width: 32, height: 32 }} />
			</a>
			&nbsp;
			<a href="https://www.linkedin.com/in/luis-ferro/" target="_blank" rel="noopener noreferrer">
				<GitHubIcon sx={{ fill: (theme) => theme.palette.common.white, width: 32, height: 32 }} />
			</a>
		</Box>
	</StyledFooter>
);
