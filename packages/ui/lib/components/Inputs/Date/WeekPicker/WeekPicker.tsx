"use client";

import { endOfWeek, isSameWeek, startOfWeek } from "@luferro/utils/date";
import type { MantineStyleProp } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendarWeek } from "@tabler/icons-react";
import { type Dispatch, type SetStateAction, useState } from "react";

type Week = { start: number; end: number };

type Props = {
	style?: MantineStyleProp;
	label?: string;
	week: Week;
	setWeek: Dispatch<SetStateAction<Week>>;
	onClear: () => void;
};

export function WeekPicker({ style, label, week, setWeek, onClear }: Props) {
	const [hovered, setHovered] = useState<Week | null>(null);

	return (
		<DatePickerInput
			style={style}
			type="range"
			label={label}
			firstDayOfWeek={0}
			value={[new Date(week.start), new Date(week.end)]}
			leftSection={<IconCalendarWeek />}
			leftSectionPointerEvents="none"
			clearable
			clearButtonProps={{ onClick: onClear }}
			getDayProps={(date) => {
				const isSelected = date.getTime() >= week.start && date.getTime() <= week.end;
				const isHovered = hovered ? isSameWeek(date, hovered.start) : false;
				const isInRange = isSelected || isHovered;
				const newWeek = { start: startOfWeek(date).getTime(), end: endOfWeek(date).getTime() };

				return {
					onMouseEnter: () => setHovered(newWeek),
					onMouseLeave: () => setHovered(null),
					inRange: isInRange,
					firstInRange: isInRange && date.getDay() === 0,
					lastInRange: isInRange && date.getDay() === 6,
					selected: isSelected,
					onClick: () => setWeek(newWeek),
				};
			}}
		/>
	);
}
