"use client";

import {
	Box,
	Flex,
	Group,
	type MantineSpacing,
	SimpleGrid,
	Space,
	Stack,
	type StyleProp,
	Text,
	Title,
	type TitleProps,
	UnstyledButton,
	VisuallyHidden,
} from "@mantine/core";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import React, {
	Children,
	type PropsWithChildren,
	cloneElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { BadgePreset } from "~/components/BadgePreset/BadgePreset";
import classes from "~/components/CardWrapper/CardWrapper.module.css";

type BaseProps = PropsWithChildren<{
	parent?: boolean;
	preview?: boolean;
	highlight?: boolean;
	label?: string;
	labelProps?: TitleProps;
	cols?: StyleProp<number>;
	gap?: MantineSpacing;
	spacing?: MantineSpacing;
	isLoading?: boolean;
	isValidating?: boolean;
	isMutating?: boolean;
	loader?: JSX.Element;
	filters?: JSX.Element;
}>;

type WithoutCollapsibleProps = BaseProps & {
	collapsible?: false;
};

type WithCollapsibleProps = BaseProps & {
	collapsible: true;
	rows: number;
};

type CollapsibleProps = WithoutCollapsibleProps | WithCollapsibleProps;

type WithoutInfiniteScrollProps = CollapsibleProps & {
	withInfiniteScroll?: false;
};

type WithInfiniteScrollProps = CollapsibleProps & {
	withInfiniteScroll: true;
	hasNextPage: boolean;
	size: number;
	setSize: (size: number) => Promise<unknown>;
};

type Props = WithoutInfiniteScrollProps | WithInfiniteScrollProps;

export function CardWrapper(props: WithoutInfiniteScrollProps): JSX.Element;
export function CardWrapper(props: WithInfiniteScrollProps): JSX.Element;
export function CardWrapper({
	parent,
	preview,
	highlight,
	collapsible,
	withInfiniteScroll,
	label,
	labelProps,
	cols = { base: 2, xs: 3, sm: 4, md: 6, lg: 8 },
	gap = "lg",
	spacing = "md",
	isLoading,
	isValidating,
	isMutating,
	loader,
	filters,
	children,
	...rest
}: Props) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [gridSize, setGridSize] = useState({ columns: 0, rows: 0 });
	const [isCollapsed, setIsCollapsed] = useState(!!collapsible);

	const collapsibleProps = rest as WithCollapsibleProps;
	const infiniteScrollingProps = rest as WithInfiniteScrollProps;

	const childrenCount = Children.count(children);
	const shouldCollapse = collapsible && childrenCount > gridSize.columns * collapsibleProps.rows;

	const gridRef = useCallback((node: HTMLDivElement) => {
		if (!node) return;
		const columns = getComputedStyle(node).getPropertyValue("grid-template-columns").split(" ").length;
		const rows = getComputedStyle(node).getPropertyValue("grid-template-rows").split(" ").length;
		setGridSize({ columns, rows });
	}, []);

	const skeleton = useMemo(() => {
		if (!loader) return [];
		const isLargeSkeleton = isMutating || withInfiniteScroll;
		const length = isLargeSkeleton ? 30 : gridSize.columns * (collapsibleProps.rows ?? 1);
		// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
		return Array.from({ length }, (_, index) => cloneElement(loader, { key: `skeleton-card-${index}` }));
	}, [withInfiniteScroll, isMutating, gridSize, loader, collapsibleProps]);

	const cards = useMemo(() => {
		if (!isMutating && !isLoading && isValidating) return Children.toArray(children).concat(...skeleton);
		if (isMutating || isLoading || isValidating) return skeleton;
		if (childrenCount === 0) {
			return (
				<Text ta="center" style={{ gridColumn: "1 / -1" }}>
					No results
				</Text>
			);
		}

		return shouldCollapse && isCollapsed
			? Children.toArray(children).slice(0, gridSize.columns * collapsibleProps.rows)
			: children;
	}, [
		shouldCollapse,
		isCollapsed,
		skeleton,
		children,
		childrenCount,
		isLoading,
		isValidating,
		isMutating,
		gridSize,
		collapsibleProps,
	]);

	useEffect(() => {
		if (!bottomRef.current || !withInfiniteScroll || isCollapsed) return;

		const { setSize, size, hasNextPage } = infiniteScrollingProps;
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && hasNextPage && !isLoading && !isValidating) {
				setSize(size + 1);
			}
		});
		observer.observe(bottomRef.current);

		return () => observer.disconnect();
	}, [withInfiniteScroll, infiniteScrollingProps, isLoading, isValidating, isCollapsed]);

	return (
		<Box className={highlight ? classes.wrapper : undefined}>
			<Stack pb={gap} gap={gap}>
				<Flex justify="space-between" align="center">
					<Group gap="xs">
						<Title order={1} fw="normal" {...labelProps} className={classes.label}>
							{label}
						</Title>
						{preview && <BadgePreset type="info" label="Preview" size="xs" highlight />}
					</Group>

					{shouldCollapse && (
						<UnstyledButton className={classes["collapse-button"]} onClick={() => setIsCollapsed((prev) => !prev)}>
							{isCollapsed ? (
								<>
									<IconMaximize />
									<VisuallyHidden>View all</VisuallyHidden>
								</>
							) : (
								<>
									<IconMinimize />
									<VisuallyHidden>View less</VisuallyHidden>
								</>
							)}
						</UnstyledButton>
					)}
				</Flex>
				{filters}
			</Stack>

			{parent ? (
				<>
					{children}
					<Space h={spacing} />
				</>
			) : (
				<SimpleGrid ref={gridRef} className={classes.grid} cols={cols} spacing={spacing} verticalSpacing={spacing}>
					{cards}
				</SimpleGrid>
			)}

			<Box ref={bottomRef} />
		</Box>
	);
}
