"use client";

import { AppShellHeader, Box, Burger, Group } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import classes from "~/components/Shell/Header/Header.module.css";

type Options = {
	isMobileOpen: boolean;
	toggleMobile: () => void;
	isDesktopOpen: boolean;
	toggleDesktop: () => void;
	logo: JSX.Element;
	spotlight: JSX.Element;
	actions: JSX.Element;
};

export function Header({
	isDesktopOpen,
	toggleDesktop,
	isMobileOpen,
	toggleMobile,
	logo,
	spotlight,
	actions,
}: Options) {
	const ref = useRef<HTMLDivElement>(null);
	const [scroll] = useWindowScroll();

	useEffect(() => {
		if (!ref.current) return;
		ref.current.classList[scroll.y !== 0 ? "add" : "remove"](classes.scrolling);
	}, [scroll]);

	return (
		<AppShellHeader ref={ref} classNames={{ header: classes.header }}>
			<Group w="100%" maw="var(--app-content-max-width)" h="100%" m="auto" px="sm">
				{!isDesktopOpen && (
					<>
						<Burger onClick={toggleDesktop} visibleFrom="md" size="sm" />
						<Box py={5}>{logo}</Box>
					</>
				)}
				{!isMobileOpen && <Burger onClick={toggleMobile} hiddenFrom="md" size="sm" />}
				<Group justify="end" flex={1}>
					{spotlight}
					{actions}
				</Group>
			</Group>
		</AppShellHeader>
	);
}
