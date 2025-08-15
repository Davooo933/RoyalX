"use client";
import { useState } from "react";

export default function CrashGame() {
	const [bet, setBet] = useState(1);
	const [cashout, setCashout] = useState(2);
	const [result, setResult] = useState<any>(null);

	async function play() {
		const res = await fetch("/api/games/crash", { method: "POST", body: JSON.stringify({ betAmount: bet, cashoutAt: cashout }), headers: { "Content-Type": "application/json" } });
		setResult(await res.json());
	}

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-6">Crash</h1>
			<div className="flex gap-3 mb-4">
				<input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded" />
				<input type="number" value={cashout} onChange={(e) => setCashout(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded" />
				<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Bet</button>
			</div>
			{result && (
				<div className="mt-4">
					<div>Win: {String(result.win)}</div>
					<div>Multiplier: {result.multiplier?.toFixed?.(2)}</div>
					<div>Payout: {result.payout?.toFixed?.(2)}</div>
				</div>
			)}
		</div>
	);
}