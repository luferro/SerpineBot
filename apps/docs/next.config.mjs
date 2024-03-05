/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},
	compiler: {
		styledComponents: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		config.externals.push({ "thread-stream": "commonjs thread-stream" });
		return config;
	},
};

export default nextConfig;
