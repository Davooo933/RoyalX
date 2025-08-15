"use client";
import { useState } from "react";

export default function AuthPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [mode, setMode] = useState<"login" | "register">("login");

	async function submit() {
		const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
		const res = await fetch(url, { method: "POST", body: JSON.stringify({ email, password, name }), headers: { "Content-Type": "application/json" } });
		if (!res.ok) {
			alert("Error");
			return;
		}
		location.href = "/";
	}

	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
			<div className="w-full max-w-md bg-zinc-900 p-6 rounded">
				<h1 className="text-2xl mb-4">{mode === "login" ? "Sign In" : "Create Account"}</h1>
				{mode === "register" && (
					<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full mb-3 px-3 py-2 bg-black border border-zinc-700 rounded" />
				)}
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full mb-3 px-3 py-2 bg-black border border-zinc-700 rounded" />
				<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full mb-6 px-3 py-2 bg-black border border-zinc-700 rounded" />
				<button onClick={submit} className="w-full px-4 py-2 bg-amber-500 text-black rounded">{mode === "login" ? "Sign In" : "Register"}</button>
				<div className="mt-4 text-sm text-zinc-400">
					{mode === "login" ? (
						<button onClick={() => setMode("register")} className="underline">Create an account</button>
					) : (
						<button onClick={() => setMode("login")} className="underline">Already have an account? Sign in</button>
					)}
				</div>
			</div>
		</div>
	);
}