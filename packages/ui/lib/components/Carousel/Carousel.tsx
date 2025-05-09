"use client";

import { Carousel as MantineCarousel } from "@mantine/carousel";
import { Box, Title, em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import { Children, cloneElement, isValidElement, useRef, useState } from "react";
import classes from "~/components/Carousel/Carousel.module.css";

type Props = { label: string };

export function Carousel({ label, children }: React.PropsWithChildren<Props>) {
	const isMobile = useMediaQuery(`(max-width: ${em("768px")}`);
	const [activeSlideIndex, setActiveSlideIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const autoplayRef = useRef(Autoplay({ delay: 10_000 }));

	return (
		<>
			<Box ref={containerRef} />
			<Box className={classes.label}>
				<Title order={1} fw="normal">
					{label}
				</Title>
			</Box>
			<MantineCarousel
				classNames={{ root: classes.carousel, controls: classes.controls, slide: classes.slide }}
				onSlideChange={(slideIndex) => setActiveSlideIndex(slideIndex)}
				withIndicators={!isMobile}
				plugins={[autoplayRef.current]}
				onMouseEnter={autoplayRef.current.stop}
				onMouseLeave={autoplayRef.current.reset}
				loop
			>
				{Children.map(children, (child, index) => {
					const isActive = index === activeSlideIndex;
					const container = containerRef.current;
					return isValidElement(child) ? cloneElement(child as JSX.Element, { isActive, container }) : null;
				})}
			</MantineCarousel>
		</>
	);
}
