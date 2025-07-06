import type { container } from "@sapphire/pieces";
import type { InferSelectModel } from "drizzle-orm";
import type { integrations } from "~/db/schema.js";
import type * as schema from "~/db/schema.js";

// Steam integration
export type SteamProfile = { id: string; url: string };
type SteamWishlist = Awaited<ReturnType<(typeof container)["gql"]["steam"]["getWishlist"]>>;
export type SteamWishlistItem = SteamWishlist[0] & { notified: { sale: boolean; release: boolean } };
export type SteamWishlistAlerts = { sale: string[]; released: string[] };
type SteamRecentlyPlayed = Awaited<ReturnType<(typeof container)["gql"]["steam"]["getRecentlyPlayed"]>>;
export type SteamLeaderboadItem = SteamRecentlyPlayed[0] & { weeklyHours: number };

export type Integration = InferSelectModel<typeof integrations>;
export type IntegrationType = (typeof schema.integrationEnum.enumValues)[number];
export type IntegrationProfile = SteamProfile;
export type IntegrationWishlistItem = SteamWishlistItem;
export type IntegrationLeaderboardItem = SteamLeaderboadItem;
