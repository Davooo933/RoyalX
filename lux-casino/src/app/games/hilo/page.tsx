"use client";
import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function HiloPage() {
	const [bet, setBet] = useState(1);
	const [choice, setChoice] = useState("HIGH");
	const { connected } = useSocket();
	async function play(){ await fetch("/api/games/hilo", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ betAmount:bet, choice }) }); }
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-3">Hi-Lo</h1>
			<div className="text-sm text-zinc-400 mb-4">{connected?"Live":"Offline"}</div>
			<div className="flex gap-3">
				<select value={choice} onChange={(e)=>setChoice(e.target.value)} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"><option>HIGH</option><option>LOW</option></select>
				<input type="number" value={bet} onChange={(e)=>setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"/>
				<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Bet</button>
			</div>
		</div>
	);
}