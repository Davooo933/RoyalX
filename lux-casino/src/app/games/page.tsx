import Link from "next/link";

const games = [
	{ key: "CRASH", name: "Crash" },
	{ key: "DICE", name: "Dice" },
	{ key: "ROULETTE", name: "Roulette" },
	{ key: "PLINKO", name: "Plinko" },
	{ key: "DOUBLE", name: "Double" },
	{ key: "HILO", name: "Hi-Lo" },
	{ key: "BINS", name: "Bins" },
	{ key: "WHEEL", name: "Wheel" },
	{ key: "BLACKJACK", name: "Blackjack" },
	{ key: "SLOTS", name: "Slots" },
	{ key: "COINFLIP", name: "Coinflip" },
];

const slotVariants = [
	{ slug: "gates-of-olympus", name: "Gates of Olympus" },
	{ slug: "lucky-ladys-charm", name: "Lucky Lady’s Charm" },
	{ slug: "book-of-ra", name: "Book Of Ra" },
	{ slug: "the-money-game", name: "The Money Game" },
	{ slug: "3-coins-egypt", name: "3 Coins Egypt" },
	{ slug: "gonzos-quest-touch", name: "Gonzo’s Quest Touch" },
	{ slug: "fruit-cocktail", name: "Fruit Cocktail" },
	{ slug: "ghost-pirates", name: "Ghost Pirates" },
];

export default function GamesPage() {
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-6">Games</h1>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
				{games.map((g) => (
					<Link key={g.key} href={`/games/${g.key.toLowerCase()}`} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
						<div className="text-sm text-zinc-400">{g.key}</div>
						<div className="mt-2 text-xl font-semibold">{g.name}</div>
					</Link>
				))}
			</div>
			<h2 className="text-xl mb-4">Slots</h2>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{slotVariants.map((s) => (
					<Link key={s.slug} href={`/games/slots/${s.slug}`} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
						<div className="mt-2 text-xl font-semibold">{s.name}</div>
					</Link>
				))}
			</div>
		</div>
	);
}