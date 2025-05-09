"use client";

import { Flex, Stack, Text, type TextProps } from "@mantine/core";
import { lazy, useEffect, useRef, useState } from "react";
import rehypeRaw from "rehype-raw";
import classes from "~/components/Truncate/Truncate.module.css";

const Markdown = lazy(() => import("react-markdown"));

type Props = {
	text: string;
	withSpoilers?: boolean;
	disableToggle?: boolean;
} & Required<Pick<TextProps, "lineClamp">> &
	TextProps;

export function Truncate({ text, withSpoilers, disableToggle, ...rest }: Props) {
	const ref = useRef<HTMLParagraphElement>(null);
	const [isClamped, setIsClamped] = useState(false);
	const [showMore, setShowMore] = useState(false);

	const handleClick = () => {
		if (!ref.current) return;

		const textLineClamp = +getComputedStyle(ref.current).getPropertyValue("--text-line-clamp");
		ref.current.style.setProperty("--text-line-clamp", textLineClamp ? "0" : rest.lineClamp.toString());
		setShowMore((prev) => !prev);
	};

	const handleSpoilers = (str: string) => {
		const startDelimiter = `<span className=${classes.spoiler}>`;
		const endDelimiter = "</span>";
		str = str.replace(/~!/g, startDelimiter).replace(/!~/g, endDelimiter);

		let isSpoiler = false;
		const lines = [];
		for (const line of str.split("\n").filter((line) => !!line)) {
			if (line === startDelimiter) {
				isSpoiler = true;
				continue;
			}

			if (!isSpoiler) {
				lines.push(line);
				continue;
			}

			const spoiler = [line];
			if (!line.startsWith(startDelimiter)) spoiler.splice(0, 0, startDelimiter);
			if (!line.endsWith(endDelimiter)) spoiler.splice(2, 0, endDelimiter);
			lines.push(spoiler.join(""));

			isSpoiler = !line.endsWith(endDelimiter);
		}

		const [fields, description] = lines.reduce<string[][]>(
			(acc, el) => {
				const position = el.startsWith("__") ? 0 : 1;
				acc[position] = acc[position].concat(el);
				return acc;
			},
			[[], []],
		);

		const hasFields = fields.length > 0;
		const hasDescription = description.length > 0;

		let text = "";
		if (hasFields) text = text.concat(fields.join("<br/>"));
		if (hasFields && hasDescription) text = text.concat("<br/><br/>");
		if (hasDescription) text = text.concat(description.join("<br/><br/>"));

		return text;
	};

	useEffect(() => {
		if (!ref.current) return;

		const observer = new ResizeObserver(([element]) => {
			if (element.target.scrollHeight > element.target.clientHeight) {
				setIsClamped(true);
			}
		});
		observer.observe(ref.current);

		return () => observer.disconnect();
	}, []);

	return (
		<Stack>
			<Text ref={ref} component="div" {...rest}>
				<Markdown
					components={{
						a: (props) => {
							if (!props.href) return;

							const url = new URL(props.href);
							const customizeUrl = ["character", "staff"].some((type) => props.href?.includes(type));
							if (customizeUrl && typeof window !== "undefined") {
								url.protocol = window.location.protocol;
								url.host = window.location.host;
							}

							return (
								<a className={classes.link} href={url.toString()}>
									{props.children}
								</a>
							);
						},
					}}
					rehypePlugins={[rehypeRaw]}
				>
					{withSpoilers ? handleSpoilers(text) : text}
				</Markdown>
			</Text>
			{isClamped && !disableToggle && (
				<Flex justify="center">
					<Text size="xs" onClick={handleClick} style={{ cursor: "pointer" }}>
						{showMore ? "Show less" : "Show more"}
					</Text>
				</Flex>
			)}
		</Stack>
	);
}
