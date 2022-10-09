import type { Command } from '../types/response';
import { Text } from '@mantine/core';
import { Client, GatewayIntentBits } from 'discord.js';
import Head from 'next/head';
import Image from 'next/image';
import Accordion from '../components/accordion';
import styles from '../styles/Home.module.css';

interface Props {
	commands: Command[];
}

export const getStaticProps = async () => {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	await client.login(process.env.BOT_TOKEN);

	let commands: Command[] = [];
	for (const { 1: guild } of client.guilds.cache) {
		const guildCommands = await guild.commands.fetch();
		if (!guildCommands) continue;

		commands = guildCommands
			.map((command) => command.toJSON() as Command)
			.map(({ name, description, options, defaultMemberPermissions }) => ({
				name,
				description,
				options: options.sort((a, b) => a.name.localeCompare(b.name)),
				defaultMemberPermissions,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	const serializedCommands = JSON.parse(
		JSON.stringify(commands, (_key, value) => {
			if (typeof value === 'undefined') return null;
			if (typeof value === 'bigint') return value.toString();
			return value;
		}),
	);

	return { props: { commands: serializedCommands }, revalidate: 60 * 60 * 24 };
};

const Home = ({ commands }: Props) => {
	return (
		<div className={styles.container}>
			<Head>
				<title>SerpineBot</title>
				<meta name="description" content="Overview of all SerpineBot commands" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<nav className={styles.navbar}>
				<div className={styles.logo}>
					<Text size="xl">SerpineBot</Text>
				</div>
				<a
					href="https://github.com/luferro/SerpineBot"
					target="_blank"
					rel="noopener noreferrer"
					className={styles.link}
				>
					<Text size="lg" className={styles.repository}>
						Github Repository
					</Text>
					&nbsp;
					<Image src={'/svg/github.svg'} alt="Github icon" width={32} height={32} />
				</a>
			</nav>

			<main className={styles.main}>
				<Accordion commands={commands} />
			</main>

			<footer className={styles.footer}>
				<Text size="lg">Made by Luís Ferro</Text>
				<div>
					<a href="https://github.com/luferro" target="_blank" rel="noopener noreferrer">
						<Image src={'/svg/github.svg'} alt="Github icon" width={32} height={32} />
					</a>
					<a href="https://www.linkedin.com/in/luis-ferro/" target="_blank" rel="noopener noreferrer">
						<Image src={'/svg/linkedin.svg'} alt="LinkedIn icon" width={32} height={32} />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default Home;
