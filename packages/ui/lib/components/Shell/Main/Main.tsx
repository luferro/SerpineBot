import { AppShellMain, Box } from "@mantine/core";

export function Main({ children }: Readonly<React.PropsWithChildren>) {
	return (
		<AppShellMain>
			<Box maw="var(--app-content-max-width)" m="auto">
				{children}
			</Box>
		</AppShellMain>
	);
}
