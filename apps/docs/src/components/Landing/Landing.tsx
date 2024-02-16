import { Typography } from "@mui/material";

import { StyledLanding } from "./Landing.styles";
import { parse } from "../../utils/markdown";

type Props = { title: string; description: string };

export const Landing = ({ title, description }: Props) => (
	<StyledLanding>
		<Typography component={"span"} fontSize={24}>
			{parse(title)}
		</Typography>
		<br />
		<Typography component={"span"} color={(theme) => theme.palette.text.secondary}>
			{parse(description)}
		</Typography>
	</StyledLanding>
);
