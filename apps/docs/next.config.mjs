/** @type {import('dotenv/config')} */
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	swcMinify: true,
};

export default nextConfig;
