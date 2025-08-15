export type GameDef = {
	key: string;
	name: string;
	path: string;
	category: "SLOT" | "TABLE" | "MINI" | "WHEEL" | "CARD";
};

export const baseGames: GameDef[] = [
	{ key: "CRASH", name: "Crash", path: "/games/crash", category: "MINI" },
	{ key: "DICE", name: "Dice", path: "/games/dice", category: "MINI" },
	{ key: "ROULETTE", name: "Roulette", path: "/games/roulette", category: "TABLE" },
	{ key: "PLINKO", name: "Plinko", path: "/games/plinko", category: "MINI" },
	{ key: "DOUBLE", name: "Double", path: "/games/double", category: "WHEEL" },
	{ key: "HILO", name: "Hi-Lo", path: "/games/hilo", category: "CARD" },
	{ key: "BINS", name: "Bins", path: "/games/bins", category: "MINI" },
	{ key: "WHEEL", name: "Wheel", path: "/games/wheel", category: "WHEEL" },
	{ key: "BLACKJACK", name: "Blackjack", path: "/games/blackjack", category: "CARD" },
	{ key: "COINFLIP", name: "Coinflip", path: "/games/coinflip", category: "MINI" },
	{ key: "SLOTS", name: "Slots", path: "/games/slots", category: "SLOT" },
];

export const slotVariants: { slug: string; key: string; name: string }[] = [
	{ slug: "gates-of-olympus", key: "SLOT_GATES_OF_OLYMPUS", name: "Gates of Olympus" },
	{ slug: "lucky-ladys-charm", key: "SLOT_LUCKY_LADYS_CHARM", name: "Lucky Lady’s Charm" },
	{ slug: "book-of-ra", key: "SLOT_BOOK_OF_RA", name: "Book Of Ra" },
	{ slug: "the-money-game", key: "SLOT_THE_MONEY_GAME", name: "The Money Game" },
	{ slug: "3-coins-egypt", key: "SLOT_3_COINS_EGYPT", name: "3 Coins Egypt" },
	{ slug: "gonzos-quest-touch", key: "SLOT_GONZOS_QUEST_TOUCH", name: "Gonzo’s Quest Touch" },
	{ slug: "fruit-cocktail", key: "SLOT_FRUIT_COCKTAIL", name: "Fruit Cocktail" },
	{ slug: "ghost-pirates", key: "SLOT_GHOST_PIRATES", name: "Ghost Pirates" },
];

export function findGameByKey(key: string): GameDef | undefined {
	return baseGames.find((g) => g.key === key) || (slotVariants.find((v) => v.key === key) ? { key, name: slotVariants.find((v) => v.key === key)!.name, path: "/games/slots", category: "SLOT" } : undefined);
}