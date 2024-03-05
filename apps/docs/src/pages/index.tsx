import { loadConfig } from "@luferro/config";
import { ApplicationCommandOptionType, Client, GatewayIntentBits } from "discord.js";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Command, Group, Option, Subcommand } from "../../types/bot";
import { Accordion } from "../components/Accordion/Accordion";
import { Footer } from "../components/Footer/Footer";
import { Landing } from "../components/Landing/Landing";
import { Main } from "../components/Main/Main";
import { StyledSkeleton } from "../components/Skeleton/Skeleton.styled";

const config = loadConfig();

type Options = { options: Option[] };
type Commands = { commands: Command[] };

const getSubcommandGroups = ({ options }: Partial<Options>) => {
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

const getSubcommands = ({ options }: Partial<Options>) => {
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

const getOptions = ({ options }: Partial<Options>) => {
	return (
		(
			options?.filter(
				({ type }) =>
					type !== ApplicationCommandOptionType.SubcommandGroup && type !== ApplicationCommandOptionType.Subcommand,
			) as Option[]
		)?.map(({ name, description, required, choices }) => ({
			name,
			description,
			required,
			choices,
		})) ?? []
	);
};

export const getStaticProps = async () => {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	await client.login(config.get("client.token"));
	if (!client.application) throw new Error("Cannot fetch registered slash commands.");

	const commands = (await client.application.commands.fetch())
		.map((command) => ({
			id: command.id,
			name: command.name,
			description: command.description,
			groups: getSubcommandGroups({ options: command.options as Option[] }),
			subcommands: getSubcommands({ options: command.options as Option[] }),
			options: getOptions({ options: command.options as Option[] }),
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	return {
		props: {
			commands: JSON.parse(JSON.stringify(commands)),
			revalidate: 60 * 60 * 24,
		},
	};
};

const Home = ({ commands }: Commands) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => setLoading(false), []);

	return (
		<>
			<Head>
				<title>SerpineBot docs</title>
				<meta name="author" content="Luís Ferro" />
				<meta name="description" content="SerpineBot: Overview of all slash commands" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Main>
				{loading ? (
					<>
						<StyledSkeleton variant="rectangular" height={200} />
						<br />
						<StyledSkeleton variant="rectangular" height={"calc(100vh - 380px)"} />
					</>
				) : (
					<>
						<Landing
							title="[SerpineBot](https://github.com/luferro/SerpineBot)"
							subtitle="Multipurpose discord bot for my private discord server"
							description={"Overview of all slash commands"}
						/>
						{commands.map(({ id, name, description, groups, subcommands, options }) => {
							return (
								<Accordion
									key={id}
									id={id}
									name={name}
									description={description}
									groups={groups}
									subcommands={subcommands}
									options={options}
								/>
							);
						})}
					</>
				)}
			</Main>
			<Footer />
		</>
	);
};

export default Home;
