import { Box } from '@mantine/core';
import { ApplicationCommandOptionType, Client, GatewayIntentBits } from 'discord.js';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { Accordion } from '../components/Accordion/Accordion';
import { Footer } from '../components/Footer/Footer';
import { Landing } from '../components/Landing/Landing';
import { Main } from '../components/Main/Main';
import { StyledSkeleton } from '../components/Skeleton/Skeleton.styled';
import { Command, Group, Option, Subcommand } from '../types/bot';

const getSubcommandGroups = ({ options }: { options?: Option[] }) => {
	return (
		(options?.filter(({ type }) => type === ApplicationCommandOptionType.SubcommandGroup) as Group[])?.map(
			({ name, description, options, required }) => ({
				name,
				description,
				required,
				subcommands: getSubcommands({ options }),
				options: getOptions({ options }),
			}),
		) ?? []
	);
};

const getSubcommands = ({ options }: { options?: Option[] }) => {
	return (
		(options?.filter(({ type }) => type === ApplicationCommandOptionType.Subcommand) as Subcommand[])?.map(
			({ name, description, options, required }) => ({
				name,
				description,
				required,
				options: getOptions({ options }),
			}),
		) ?? []
	);
};

const getOptions = ({ options }: { options?: Option[] }) => {
	return (
		(
			options?.filter(
				({ type }) =>
					type !== ApplicationCommandOptionType.SubcommandGroup &&
					type !== ApplicationCommandOptionType.Subcommand,
			) as Option[]
		)?.map(({ name, description, required, choices }) => ({ name, description, required, choices })) ?? []
	);
};

export const getStaticProps = async () => {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	await client.login(process.env.BOT_TOKEN);
	if (!client.application) throw new Error('Could not fetch registered slash commands.');

	const commands = (await client.application.commands.fetch())
		.map((command) => ({
			name: command.name,
			description: command.description,
			groups: getSubcommandGroups({ options: command.options as Option[] }),
			subcommands: getSubcommands({ options: command.options as Option[] }),
			options: getOptions({ options: command.options as Option[] }),
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	return { props: { commands: JSON.parse(JSON.stringify(commands)), revalidate: 60 * 60 * 24 } };
};

const Home = ({ commands }: { commands: Command[] }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => setLoading(false), []);

	return (
		<Box>
			<Head>
				<title>SerpineBot Slash Commands Overview</title>
				<meta name="author" content="Luís Ferro" />
				<meta name="description" content="Overview of all SerpineBot slash commands" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Main>
				<StyledSkeleton visible={loading}>
					<Landing
						title="SerpineBot, a multipurpose discord bot for my private discord server"
						description={`This page is an overview of all available slash commands.<br/>
						Does not include webhooks or jobs documentation.<br/>
						You can look into the repository at [https://github.com/luferro/SerpineBot](https://github.com/luferro/SerpineBot)`}
					/>
				</StyledSkeleton>
				<StyledSkeleton visible={loading}>
					<Accordion commands={commands} />
				</StyledSkeleton>
			</Main>

			<Footer />
		</Box>
	);
};

export default Home;
