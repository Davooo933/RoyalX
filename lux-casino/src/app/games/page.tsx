import Link from "next/link";
import { baseGames, slotVariants } from "@/config/games";

export default function GamesPage() {
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-6">Games</h1>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
				{baseGames.map((g) => (
					<Link key={g.key} href={g.path} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
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