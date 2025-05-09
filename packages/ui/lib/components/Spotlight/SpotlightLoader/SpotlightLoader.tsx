import { Loader } from "@mantine/core";
import { SpotlightEmpty as MantineSpotlightEmpty } from "@mantine/spotlight";

export function SpotlightLoader() {
	return (
		<MantineSpotlightEmpty>
			<Loader color="var(--mantine-primary-color-filled)" />
		</MantineSpotlightEmpty>
	);
}
