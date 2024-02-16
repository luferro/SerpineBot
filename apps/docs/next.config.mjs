/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	compiler: {
		styledComponents: true,
	},
	swcMinify: true,
};

export default nextConfig;
