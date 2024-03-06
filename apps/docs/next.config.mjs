import { loadConfig } from "@luferro/config";

const locale = loadConfig().get("locale");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		defaultLocale: locale,
		locales: [locale],
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
