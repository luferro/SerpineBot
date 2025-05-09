import type { container } from "@sapphire/pieces";
import type { InferSelectModel } from "drizzle-orm";
import type { integrations } from "~/db/schema.js";
import type * as schema from "~/db/schema.js";

export type IntegrationType = (typeof schema.integrationEnum.enumValues)[number];

// biome-ignore lint/suspicious/noExplicitAny: can be whatever
export type Integration<TProfile = any, TWishlist = any> = Omit<
	InferSelectModel<typeof integrations>,
	"profile" | "wishlist"
> & { profile: TProfile; wishlist: TWishlist[] };

export type SteamProfile = { id: string };
export type SteamWishlistItem = Awaited<ReturnType<(typeof container)["gql"]["steam"]["getWishlist"]>>[0] & {
	notified: { sale: boolean; release: boolean };
};
export type SteamWishlistAlerts = { sale: string[]; released: string[] };
