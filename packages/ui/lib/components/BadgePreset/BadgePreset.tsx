import { Anchor, Badge, type BadgeProps } from "@mantine/core";

type InfoBadgeProps = BadgeProps & { type: "info"; highlight?: boolean; label: string };
type LinkBadgeProps = BadgeProps & { type: "link"; highlight?: boolean; label: string; href: string; target?: string };
type MatureBadgeProps = BadgeProps & { type: "mature" };

type Props = InfoBadgeProps | LinkBadgeProps | MatureBadgeProps;

export function BadgePreset(props: InfoBadgeProps): JSX.Element;
export function BadgePreset(props: LinkBadgeProps): JSX.Element;
export function BadgePreset(props: MatureBadgeProps): JSX.Element;
export function BadgePreset({ type, ...rest }: Props) {
	switch (type) {
		case "info": {
			const { highlight, label, ...props } = rest as Omit<InfoBadgeProps, "type">;
			return (
				<Badge
					style={{
						...(highlight && {
							borderWidth: "2px",
							borderColor: "var(--mantine-primary-color-filled)",
							color: "var(--mantine-primary-color-filled)",
						}),
					}}
					{...props}
				>
					{label}
				</Badge>
			);
		}
		case "link": {
			const { highlight, label, href, target, ...props } = rest as Omit<LinkBadgeProps, "type">;
			return (
				<Anchor href={href} target={target}>
					<Badge
						{...(highlight
							? { bg: "var(--mantine-accent-color)" }
							: { bg: "var(--mantine-primary-color-filled)", c: "var(--mantine-color-black)" })}
						{...props}
					>
						{label}
					</Badge>
				</Anchor>
			);
		}
		case "mature":
			return (
				<Badge bg="var(--mantine-color-red-filled)" {...rest}>
					18+
				</Badge>
			);
	}
}
