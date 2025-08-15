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

export default function GamesPage() {
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-6">Games</h1>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{games.map((g) => (
					<Link key={g.key} href={`/games/${g.key.toLowerCase()}`} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
						<div className="text-sm text-zinc-400">{g.key}</div>
						<div className="mt-2 text-xl font-semibold">{g.name}</div>
					</Link>
				))}
			</div>
		</div>
	);
}