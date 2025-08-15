"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
	const [stats, setStats] = useState<any>(null);
	const [userId, setUserId] = useState("");
	const [amount, setAmount] = useState(0);

	useEffect(() => {
		axios.get("/api/admin/stats").then((res) => setStats(res.data)).catch(() => {});
	}, []);

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-6">Admin Dashboard</h1>
			{stats && (
				<div className="grid grid-cols-2 gap-4 mb-8">
					<div className="p-4 rounded bg-zinc-900">Users: {stats.users}</div>
					<div className="p-4 rounded bg-zinc-900">Balance: {stats.totalBalance} USDT</div>
					<div className="p-4 rounded bg-zinc-900">Wagered: {stats.wagered} USDT</div>
					<div className="p-4 rounded bg-zinc-900">Paid: {stats.paid} USDT</div>
				</div>
			)}
			<div className="p-6 rounded bg-zinc-900">
				<h2 className="text-xl mb-4">Send Bonus</h2>
				<div className="flex gap-2">
					<input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="px-3 py-2 bg-black border border-zinc-700 rounded w-96" />
					<input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" className="px-3 py-2 bg-black border border-zinc-700 rounded w-48" />
					<button
						onClick={async () => {
							await axios.post("/api/admin/bonus", { userId, amount });
							alert("Bonus sent");
						}}
						className="px-4 py-2 bg-emerald-600 rounded"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}