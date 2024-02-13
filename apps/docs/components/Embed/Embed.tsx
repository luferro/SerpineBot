import { Box, Typography } from "@mui/material";
import parse from "html-react-parser";
import { marked } from "marked";
import { useEffect, useState } from "react";

import samples from "../../samples.json";
import {
	StyledAuthor,
	StyledContent,
	StyledDescription,
	StyledEmbed,
	StyledFields,
	StyledImage,
	StyledThumbnail,
	StyledTitle,
} from "./Embed.styled";

type EmbedJson = {
	author: { icon?: string; name: string } | null;
	title: string;
	url: string | null;
	description: string | null;
	fields: { key: string; value: string; inline: boolean }[];
	thumbnail: string | null;
	image: string | null;
};

type Props = { sample: string };

export const Embed = ({ sample }: Props) => {
	const [color, setColor] = useState("#fff");

	useEffect(() => setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`), []);

	const metadata = Object.entries(samples).find(([key]) => key === sample)?.[1] as EmbedJson;
	if (!metadata) return <Typography fontStyle="italic">Embed sample is not available.</Typography>;

	const { author, description, fields, image, thumbnail, title, url } = metadata;

	return (
		<StyledEmbed style={{ borderLeft: `4px solid ${color}` }}>
			<StyledContent>
				<Box>
					<StyledAuthor>
						{author?.icon && (
							<>
								<picture>
									<source srcSet={author.icon} type="image/webp" />
									<img src={author.icon} alt="Embed author icon" loading="lazy" />
								</picture>
								<span>{author.name}</span>
							</>
						)}
					</StyledAuthor>
					<StyledTitle>
						{url ? (
							<a href={url} rel="noreferrer noopener" target="_blank">
								{parse(marked.parse(title))}
							</a>
						) : (
							parse(marked.parse(title ?? "N/A"))
						)}
					</StyledTitle>
					{description && <StyledDescription>{parse(marked.parse(description))}</StyledDescription>}
					<StyledFields>
						{!!fields.length &&
							fields.map(({ key, value, inline }) => (
								<Box className={inline ? "inline-field" : "field"} key={key}>
									<Box>{parse(marked.parse(key))}</Box>
									<Box>{parse(marked.parse(value))}</Box>
								</Box>
							))}
					</StyledFields>
				</Box>
				{thumbnail && (
					<StyledThumbnail>
						<picture>
							<source srcSet={thumbnail} type="image/webp" />
							<img src={thumbnail} alt="Embed content" loading="lazy" />
						</picture>
					</StyledThumbnail>
				)}
			</StyledContent>
			{image && (
				<StyledImage>
					<picture>
						<source srcSet={image} type="image/webp" />
						<img src={image} alt="Embed content" loading="lazy" />
					</picture>
				</StyledImage>
			)}
		</StyledEmbed>
	);
};
