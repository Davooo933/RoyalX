"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsersPage() {
	const [q, setQ] = useState("");
	const [users, setUsers] = useState<any[]>([]);
	const [adjust, setAdjust] = useState<Record<string, number>>({});
	useEffect(() => {
		(async () => {
			const res = await axios.get(`/api/admin/users?q=${encodeURIComponent(q)}`);
			setUsers(res.data.users);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	async function reload() {
		const res = await axios.get(`/api/admin/users?q=${encodeURIComponent(q)}`);
		setUsers(res.data.users);
	}
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-4">Users</h1>
			<div className="flex gap-2 mb-4">
				<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name" className="px-3 py-2 bg-black border border-zinc-700 rounded w-96" />
				<button onClick={reload} className="px-4 py-2 bg-zinc-800 rounded">Search</button>
			</div>
			<div className="space-y-3">
				{users.map((u) => (
					<div key={u.id} className="p-3 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
						<div>
							<div className="font-semibold">{u.email}</div>
							<div className="text-xs text-zinc-400">{u.name || "-"} • {u.status}</div>
						</div>
						<div className="flex items-center gap-2">
							<input type="number" placeholder="Adjust" value={adjust[u.id] || 0} onChange={(e) => setAdjust({ ...adjust, [u.id]: Number(e.target.value) })} className="w-24 px-2 py-1 bg-black border border-zinc-700 rounded" />
							<button onClick={async () => { await axios.put("/api/admin/users", { userId: u.id, action: "ADJUST", amount: adjust[u.id] }); reload(); }} className="px-3 py-1 rounded border border-zinc-700">Apply</button>
							<button onClick={async () => { await axios.put("/api/admin/users", { userId: u.id, action: u.status === "SUSPENDED" ? "UNSUSPEND" : "SUSPEND" }); reload(); }} className="px-3 py-1 rounded border border-zinc-700">{u.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}