export const isValidDate = (str: string) => {
	const { 0: year, 1: month, 2: day } = str.split(/-|\//);
	const date = new Date(Number(year), Number(month) - 1, Number(day));
	return (
		date.getFullYear() === Number(year) && date.getMonth() + 1 === Number(month) && date.getDate() === Number(day)
	);
};
