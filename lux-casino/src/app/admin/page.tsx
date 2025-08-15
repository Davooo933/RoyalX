"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";

export default function AdminPage() {
	const [stats, setStats] = useState<any>(null);
	const [userId, setUserId] = useState("");
	const [amount, setAmount] = useState(0);
	const [games, setGames] = useState<any[]>([]);
	const [events, setEvents] = useState<any[]>([]);
	const { socket, connected } = useSocket();

	useEffect(() => {
		axios.get("/api/admin/stats").then((res) => setStats(res.data)).catch(() => {});
		axios.get("/api/admin/games").then((res) => setGames(res.data.games)).catch(() => {});
	}, []);

	useEffect(() => {
		if (!socket) {
			return;
		}
		const onEvent = (e: any) => setEvents((prev) => [e, ...prev].slice(0, 50));
		socket.on("game_event", onEvent);
		return () => {
			socket.off("game_event", onEvent);
		};
	}, [socket]);

	async function setRtp(key: string, rtp: number) {
		await axios.put("/api/admin/games", { key, rtpTarget: rtp });
		const res = await axios.get("/api/admin/games");
		setGames(res.data.games);
	}

	return (
		<div className="min-h-screen bg-black text-white p-8 space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl">Admin Dashboard</h1>
				<div className="text-sm text-zinc-400">{connected ? "Live monitoring" : "Offline"}</div>
			</div>
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="p-4 rounded bg-zinc-900">Users: {stats.users}</div>
					<div className="p-4 rounded bg-zinc-900">Balance: {stats.totalBalance} USDT</div>
					<div className="p-4 rounded bg-zinc-900">Wagered: {stats.wagered} USDT</div>
					<div className="p-4 rounded bg-zinc-900">Paid: {stats.paid} USDT</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="p-6 rounded bg-zinc-900">
					<h2 className="text-xl mb-4">Send Bonus</h2>
					<div className="flex gap-2">
						<input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="px-3 py-2 bg-black border border-zinc-700 rounded w-96" />
						<input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" className="px-3 py-2 bg-black border border-zinc-700 rounded w-48" />
						<button onClick={async () => { await axios.post("/api/admin/bonus", { userId, amount }); alert("Bonus sent"); }} className="px-4 py-2 bg-emerald-600 rounded">Send</button>
					</div>
				</div>
				<div className="p-6 rounded bg-zinc-900">
					<h2 className="text-xl mb-4">Games & Risk Controls</h2>
					<div className="space-y-3">
						{games.map((g) => (
							<div key={g.key} className="flex items-center justify-between border border-zinc-800 rounded p-3">
								<div>
									<div className="font-semibold">{g.name}</div>
									<div className="text-xs text-zinc-400">{g.key} • RTP {Math.round(g.rtpTarget * 100)}%</div>
								</div>
								<div className="flex items-center gap-2">
									<input type="number" defaultValue={Math.round(g.rtpTarget * 100)} onBlur={(e) => setRtp(g.key, Number(e.target.value) / 100)} className="w-20 px-2 py-1 bg-black border border-zinc-700 rounded text-right" />
									<button onClick={async () => { await axios.put("/api/admin/games", { key: g.key, isEnabled: !g.isEnabled }); const res = await axios.get("/api/admin/games"); setGames(res.data.games); }} className="px-3 py-1 rounded border border-zinc-700">
										{g.isEnabled ? "Disable" : "Enable"}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="p-6 rounded bg-zinc-900">
				<h2 className="text-xl mb-4">Live Monitoring</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-auto">
					{events.map((e, i) => (
						<div key={i} className="p-3 rounded bg-zinc-950 border border-zinc-800 text-sm">
							<div className="text-zinc-400">{new Date(e.at).toLocaleString()}</div>
							<div className="font-semibold">{e.gameKey}</div>
							<div>{e.win ? "Win" : "Loss"} • Bet {e.betAmount} • Payout {e.payout}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}