import os from "node:os";
import path from "node:path";
import nconf from "nconf";
import { processEnv } from "./processors/env.js";

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "config");
const DEFAULT_LOCAL_CONFIG_PATH = path.join(os.homedir(), ".sb-config");
const ENVIRONMENTS = ["development", "test", "production"] as const;

type Environment = (typeof ENVIRONMENTS)[number];
export type Config = ReturnType<typeof loadConfig>;

type Options = {
	/**
	 * Sets the application name
	 * @default process.env.npm_package_name
	 */
	applicationName?: string;
	/**
	 * Sets the config path
	 * @default path.join(process.cwd(), "config")
	 */
	configPath?: string;
	/**
	 * Sets the local config path
	 * @default path.join(os.homedir(), '.sb-config')
	 */
	localConfigPath?: string;
};

export const loadConfig = (options: Options = {}) => {
	return _loadConfig({ ...options, environmentVariables: process.env });
};

type _Options = Options & { environmentVariables?: Partial<Record<string, string>> };

export const _loadConfig = ({
	applicationName,
	configPath = DEFAULT_CONFIG_PATH,
	localConfigPath = DEFAULT_LOCAL_CONFIG_PATH,
	environmentVariables = {},
}: _Options = {}) => {
	applicationName ??= environmentVariables.npm_package_name;
	if (!applicationName) {
		throw new Error("Could not retrieve the application name.");
	}

	const isAllowedEnvironment = (env: string): env is Environment => ENVIRONMENTS.includes(env as Environment);

	const runtimeEnvironment = environmentVariables.RUNTIME_ENV ?? "development";
	if (!isAllowedEnvironment(runtimeEnvironment)) {
		throw new Error(
			`Environment ${runtimeEnvironment} is not allowed. Use one of the following: ${ENVIRONMENTS.join()}`,
		);
	}

	for (const [key, value] of Object.entries(processEnv())) {
		nconf.set(key, value);
	}

	nconf
		.file(`local-config-path-${runtimeEnvironment}-config`, {
			file: path.join(path.join(localConfigPath, applicationName), `${runtimeEnvironment}.json`),
		})
		.file("local-config-path-default-config", {
			file: path.join(path.join(localConfigPath, applicationName), "default.json"),
		})
		.file(`config-path-${runtimeEnvironment}-config`, { file: path.join(configPath, `${runtimeEnvironment}.json`) })
		.file("config-path-default-config", { file: path.join(configPath, "default.json") });

	return {
		runtimeEnvironment,
		get: <T = string>(key?: string): T => nconf.get(key?.replaceAll(".", ":")),
	};
};
