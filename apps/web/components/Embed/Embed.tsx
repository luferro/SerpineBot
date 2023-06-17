import { Box, Text } from '@mantine/core';
import parse from 'html-react-parser';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

import samples from '../../samples.json';
import {
	StyledAuthor,
	StyledContent,
	StyledDescription,
	StyledEmbed,
	StyledFields,
	StyledImage,
	StyledThumbnail,
	StyledTitle,
} from './Embed.styled';

type EmbedJson = {
	author: { icon?: string; name: string } | null;
	title: string;
	url: string | null;
	description: string | null;
	fields: { key: string; value: string; inline: boolean }[];
	thumbnail: string | null;
	image: string | null;
};

export const Embed = ({ name }: { name: string }) => {
	const [color, setColor] = useState('#fff');

	useEffect(() => setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`), []);

	const metadata = Object.entries(samples).find(([key]) => key === name)?.[1] as EmbedJson;
	if (!metadata) return <Text italic>Embed sample is not available.</Text>;

	return (
		<StyledEmbed style={{ borderLeft: `4px solid ${color}` }}>
			<StyledContent>
				<Box>
					<StyledAuthor>
						{metadata?.author && metadata?.author.icon && (
							<>
								<picture>
									<source srcSet={metadata.author.icon} type="image/webp" />
									<img src={metadata.author.icon} alt="Embed author icon" loading="lazy" />
								</picture>
								<span>{metadata.author.name}</span>
							</>
						)}
					</StyledAuthor>
					<StyledTitle>
						{metadata?.url ? (
							<a href={metadata.url} rel="noreferrer noopener" target="_blank">
								{parse(marked.parse(metadata.title))}
							</a>
						) : (
							parse(marked.parse(metadata?.title ?? 'N/A'))
						)}
					</StyledTitle>
					{metadata?.description && (
						<StyledDescription>{parse(marked.parse(metadata.description))}</StyledDescription>
					)}
					<StyledFields>
						{!!metadata?.fields.length &&
							metadata.fields.map(({ key, value, inline }) => (
								<Box className={inline ? 'inline-field' : 'field'} key={key}>
									<Box>{parse(marked.parse(key))}</Box>
									<Box>{parse(marked.parse(value))}</Box>
								</Box>
							))}
					</StyledFields>
				</Box>

				{metadata?.thumbnail && (
					<StyledThumbnail>
						<picture>
							<source srcSet={metadata.thumbnail} type="image/webp" />
							<img src={metadata.thumbnail} alt="Embed thumbnail" loading="lazy" />
						</picture>
					</StyledThumbnail>
				)}
			</StyledContent>
			{metadata?.image && (
				<StyledImage>
					<picture>
						<source srcSet={metadata.image} type="image/webp" />
						<img src={metadata.image} alt="Embed image" loading="lazy" />
					</picture>
				</StyledImage>
			)}
		</StyledEmbed>
	);
};
