"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function CrashGame() {
	const [bet, setBet] = useState(1);
	const [cashout, setCashout] = useState(2);
	const [result, setResult] = useState<any>(null);
	const [events, setEvents] = useState<any[]>([]);
	const { socket, connected } = useSocket();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		if (!socket) return;
		const onEvent = (payload: any) => {
			setEvents((prev) => [payload, ...prev].slice(0, 20));
		};
		socket.on("game_event", onEvent);
		return () => {
			socket.off("game_event", onEvent);
		};
	}, [socket]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let t = 0;
		const draw = () => {
			const w = canvas.width, h = canvas.height;
			ctx.clearRect(0, 0, w, h);
			const gradient = ctx.createLinearGradient(0, 0, w, h);
			gradient.addColorStop(0, "#FFD70022");
			gradient.addColorStop(1, "#ffffff05");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, w, h);
			ctx.beginPath();
			ctx.strokeStyle = "#FFD700";
			ctx.lineWidth = 2;
			for (let x = 0; x < w; x++) {
				const y = h - Math.log(1 + x + t) * 10 % h;
				if (x === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
			t += 0.8;
			animRef.current = requestAnimationFrame(draw);
		};
		draw();
		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
		};
	}, []);

	async function play() {
		const res = await fetch("/api/games/crash", { method: "POST", body: JSON.stringify({ betAmount: bet, cashoutAt: cashout }), headers: { "Content-Type": "application/json" } });
		setResult(await res.json());
	}

	return (
		<div className="min-h-screen bg-black text-white p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
			<div className="md:col-span-2">
				<h1 className="text-3xl mb-3">Crash</h1>
				<canvas ref={canvasRef} width={1000} height={400} className="w-full rounded-xl border border-amber-500/30 bg-zinc-950" />
				<div className="flex gap-3 mt-4">
					<input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded" />
					<input type="number" value={cashout} onChange={(e) => setCashout(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded" />
					<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Bet</button>
					<span className="text-sm text-zinc-400 self-center">{connected ? "Live" : "Offline"}</span>
				</div>
				{result && (
					<div className="mt-4">
						<div>Win: {String(result.win)}</div>
						<div>Multiplier: {result.payoutMultiplier?.toFixed?.(2)}</div>
						<div>Payout: {result.payout?.toFixed?.(2)}</div>
					</div>
				)}
			</div>
			<div>
				<h2 className="text-xl mb-3">Live events</h2>
				<div className="space-y-2 max-h-[420px] overflow-auto">
					{events.map((e, i) => (
						<div key={i} className="p-3 rounded bg-zinc-900 border border-zinc-800 text-sm">
							<div className="text-zinc-400">{new Date(e.at).toLocaleTimeString()} • {e.gameKey}</div>
							<div>{e.win ? "Win" : "Loss"} — Bet {e.betAmount}, Payout {e.payout}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}