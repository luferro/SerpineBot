/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	cleanDistDir: true,
	i18n: { locales: ["en"], defaultLocale: "en" },
	compiler: { styledComponents: true },
	eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
