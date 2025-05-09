"use client";

import { AppShellNavbar, AppShellSection, Burger, Divider, Flex, Space } from "@mantine/core";
import { useEffect } from "react";
import classes from "./NavBar.module.css";

type Props = {
	isMobileOpen: boolean;
	toggleMobile: () => void;
	isDesktopOpen: boolean;
	toggleDesktop: () => void;
	logo: JSX.Element;
	links: JSX.Element;
	footer: JSX.Element;
};

export function NavBar({ isDesktopOpen, toggleDesktop, isMobileOpen, toggleMobile, logo, links, footer }: Props) {
	useEffect(() => {
		window.document.body.style.overflowY = isMobileOpen ? "hidden" : "auto";
	}, [isMobileOpen]);

	return (
		<AppShellNavbar className={classes.navbar} px="sm">
			<Flex align="center" justify="space-between" py="md">
				{logo}
				<Burger opened={isMobileOpen} onClick={toggleMobile} hiddenFrom="md" size="sm" />
				<Burger opened={isDesktopOpen} onClick={toggleDesktop} visibleFrom="md" size="sm" />
			</Flex>
			<Space h="xl" />
			<AppShellSection className={classes.links}>{links}</AppShellSection>
			<Divider />
			<AppShellSection py="md">{footer}</AppShellSection>
		</AppShellNavbar>
	);
}
