module.exports = {
    formatCentsToEuros(cents) {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
    },
    formatSecondsToMinutes(time) {
		const minutes = Math.floor(time % 3600 / 60).toString().padStart(2,'0');
        const seconds = Math.floor(time % 60).toString().padStart(2,'0');

		return `${minutes}:${seconds}`;
	},
    formatMinutesToHours(time) {
        const hours = Math.floor(time / 60).toString();          
        const minutes = (time % 60).toString().padStart(2,'0');

        return `${hours}h${minutes}m`;
    },
	formatStringCapitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
}