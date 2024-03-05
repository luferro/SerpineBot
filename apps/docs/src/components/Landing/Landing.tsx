import { Typography } from "@mui/material";
import { parse } from "../../utils/markdown";
import { StyledLanding } from "./Landing.styles";

type Props = { title: string; subtitle?: string; description: string };

export const Landing = ({ title, subtitle, description }: Props) => (
	<StyledLanding>
		<Typography component={"span"} textAlign={"center"} fontSize={28}>
			{parse(title)}
		</Typography>
		{!!subtitle && (
			<Typography component={"span"} textAlign={"center"} fontSize={20} fontStyle={"italic"}>
				{parse(subtitle)}
			</Typography>
		)}

		<br />
		<Typography component={"span"} textAlign={"center"} color={(theme) => theme.palette.text.secondary}>
			{parse(description)}
		</Typography>
	</StyledLanding>
);
