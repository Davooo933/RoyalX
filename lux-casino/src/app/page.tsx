"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black via-[#0a0a0f] to-black text-white">
			<div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(1000px 600px at 50% -10%, rgba(255,215,0,0.15), transparent 60%)" }} />
			<header className="flex items-center justify-between px-8 py-6">
				<div className="text-2xl font-semibold tracking-widest">LUX CASINO</div>
				<nav className="flex items-center gap-6 text-sm">
					<Link href="/games" className="hover:text-amber-400">Games</Link>
					<Link href="/admin" className="hover:text-amber-400">Admin</Link>
					<Link href="/auth" className="px-4 py-2 rounded bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30">Sign In</Link>
				</nav>
			</header>
			<main className="px-8 pt-16 pb-24">
				<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-extrabold tracking-tight">
					Experience Ultra Luxury Gaming
				</motion.h1>
				<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-6 text-lg text-zinc-200 max-w-2xl">
					Gates of Olympus, Lucky Lady’s Charm, Book Of Ra, Blackjack, Crash, Dice, Roulette, Plinko, and more — all with seamless USDT TRC-20.
				</motion.p>
				<div className="mt-10 flex gap-4">
					<Link href="/games" className="px-6 py-3 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold shadow-[0_0_40px_rgba(255,200,50,.4)]">
						Play Now
					</Link>
					<Link href="/auth" className="px-6 py-3 rounded border border-amber-400/40 hover:bg-amber-500/10">
						Claim Bonus
					</Link>
				</div>
				<div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
					{["Crash","Roulette","Dice","Plinko"].map((g) => (
						<div key={g} className="aspect-video rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4">
							<div className="text-sm text-zinc-400">Featured</div>
							<div className="mt-2 text-xl font-semibold">{g}</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
