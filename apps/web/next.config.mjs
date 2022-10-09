/** @type {import('dotenv/config')} */
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['images-ext-1.discordapp.net', 'images-ext-2.discordapp.net', 'www.themoviedb.org'],
	},
	swcMinify: true,
};

export default nextConfig;
