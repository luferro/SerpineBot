type FormatCurrencyOptions = {
	/** @default "EUR" */
	currency?: string;
	locale?: string;
};

export const formatCurrency = (amount: number, { currency = "EUR", locale = "pt-PT" }: FormatCurrencyOptions = {}) => {
	return new Intl.NumberFormat(locale, { style: "currency", currency })
		.format(amount)
		.replace(String.fromCharCode(160), " ");
};
