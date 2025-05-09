import { processEnv } from "./processors/env.js";

const os = await import("node:os").catch(() => null);
const path = await import("node:path").catch(() => null);
const nconf = await import("nconf").catch(() => null);

const DEFAULT_CONFIG_PATH = path?.join(process.cwd(), "config") ?? "";
const DEFAULT_LOCAL_CONFIG_PATH = path && os ? path.join(os.homedir(), ".sb-config") : "";
const ENVIRONMENTS = ["development", "test", "production"] as const;

const DEFAULT_LOCALE = "en-US";
const DEFAULT_TIMEZONE = "UTC";

type Environment = (typeof ENVIRONMENTS)[number];
export type Config = ReturnType<typeof loadConfig>;

let currentLocale = process.env.LOCALE ?? DEFAULT_LOCALE;
let currentTimezone = process.env.TZ ?? DEFAULT_TIMEZONE;

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

	if (nconf && path && os) {
		nconf.default
			.file(`local-config-path-${runtimeEnvironment}-config`, {
				file: path.join(path.join(localConfigPath, applicationName), `${runtimeEnvironment}.json`),
			})
			.file("local-config-path-default-config", {
				file: path.join(path.join(localConfigPath, applicationName), "default.json"),
			})
			.file(`config-path-${runtimeEnvironment}-config`, { file: path.join(configPath, `${runtimeEnvironment}.json`) })
			.file("config-path-default-config", { file: path.join(configPath, "default.json") });

		for (const [key, value] of Object.entries(processEnv())) {
			nconf.default.set(key, value);
		}
	}

	return {
		runtimeEnvironment,
		get timezone() {
			return currentTimezone;
		},
		setTimezone: (timezone: string) => {
			currentTimezone = timezone;
		},
		get locale() {
			return currentLocale;
		},
		setLocale: (locale: string) => {
			currentLocale = locale;
		},
		get: <T = string>(key?: string): T => {
			if (nconf) return nconf.default.get(key?.replaceAll(".", ":"));

			const env = processEnv();
			const value = key ? env[key] : "";
			return value as T;
		},
	};
};
