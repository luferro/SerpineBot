import os from "node:os";
import path from "node:path";

import type { IConfig } from "config";

import { processEnv } from "./processors/env";

const DEFAULT_LOCAL_PATH = path.join(os.homedir(), ".sb-config");
const ENVIRONMENTS = ["development", "test", "production"] as const;

type Environment = (typeof ENVIRONMENTS)[number];
export type Config = ReturnType<typeof loadConfig>;

type Options = {
	/**
	 * Sets tthe application name
	 * @default process.env.npm_package_name
	 */
	applicationName?: string;
	/**
	 * Sets the config path
	 * @default "config"
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
	configPath = "config",
	localConfigPath = DEFAULT_LOCAL_PATH,
	environmentVariables = {},
}: _Options = {}) => {
	applicationName ??= environmentVariables.npm_package_name;
	if (!applicationName) {
		throw new Error("Could not retrieve the application name.");
	}

	const runtimeEnvironment = environmentVariables.RUNTIME_ENV ?? "development";
	environmentVariables.NODE_CONFIG_ENV = runtimeEnvironment;

	const isAllowedEnvironment = (env: string): env is Environment => ENVIRONMENTS.includes(env as Environment);
	if (!isAllowedEnvironment(runtimeEnvironment)) {
		throw new Error(
			`Environment ${runtimeEnvironment} is not allowed. Use one of the following: ${ENVIRONMENTS.join()}`,
		);
	}

	const configPaths = [configPath, path.join(localConfigPath, applicationName)];
	environmentVariables.NODE_CONFIG_DIR = configPaths.join(path.delimiter);

	environmentVariables.SUPPRESS_NO_CONFIG_WARNING = "true";

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const config = require("config") as IConfig;
	config.util.extendDeep(config, processEnv());
	return Object.assign(config, { runtimeEnvironment });
};
