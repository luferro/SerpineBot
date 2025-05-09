"use client";

import { AppShell, type AppShellProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Header } from "./Header/Header";
import { Main } from "./Main/Main";
import { NavBar } from "./NavBar/NavBar";

type Props = Readonly<{ children: React.ReactNode }> & {
	layout?: AppShellProps["layout"];
	navbar?: {
		logo: JSX.Element;
		links: JSX.Element;
		footer: JSX.Element;
	};
	header: {
		logo: JSX.Element;
		spotlight: JSX.Element;
		actions: JSX.Element;
	};
};

export function Shell({ layout = "alt", navbar, header, children }: Props) {
	const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
	const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

	return (
		<AppShell
			layout={layout}
			header={{ height: "var(--app-header-height)" }}
			navbar={navbar && { width: 300, breakpoint: "md", collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
			footer={{ height: 60 }}
			padding="md"
		>
			{navbar && (
				<NavBar
					isDesktopOpen={desktopOpened}
					toggleDesktop={toggleDesktop}
					isMobileOpen={mobileOpened}
					toggleMobile={toggleMobile}
					{...navbar}
				/>
			)}
			<Header
				isDesktopOpen={desktopOpened}
				toggleDesktop={toggleDesktop}
				isMobileOpen={mobileOpened}
				toggleMobile={toggleMobile}
				{...header}
			/>
			<Main>{children}</Main>
		</AppShell>
	);
}
