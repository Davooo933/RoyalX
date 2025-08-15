"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function DicePage() {
	const [bet, setBet] = useState(1);
	const [rollUnder, setRollUnder] = useState(50);
	const { connected } = useSocket();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useEffect(()=>{ const c=canvasRef.current; if(!c)return; const ctx=c.getContext("2d"); if(!ctx)return; let t=0; let id=0; const draw=()=>{ const w=c.width,h=c.height; ctx.clearRect(0,0,w,h); ctx.fillStyle="#111"; ctx.fillRect(0,0,w,h); ctx.fillStyle="#FFD700"; ctx.fillRect(50,h-80, (w-100)*(rollUnder/100), 20); ctx.strokeStyle="#444"; ctx.strokeRect(50,h-80,w-100,20); ctx.fillStyle="#fff"; ctx.font="48px sans-serif"; const val = Math.floor((Math.sin(t/10)+1)/2*100); ctx.fillText(String(val), w/2-30, h/2); t++; id=requestAnimationFrame(draw); }; draw(); return ()=> cancelAnimationFrame(id); },[rollUnder]);
	async function play(){ await fetch("/api/games/dice", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ betAmount:bet, rollUnder }) }); }
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-3">Dice</h1>
			<div className="text-sm text-zinc-400 mb-2">{connected?"Live":"Offline"}</div>
			<canvas ref={canvasRef} width={600} height={400} className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 mb-4" />
			<div className="flex gap-3">
				<input type="number" value={rollUnder} onChange={(e)=>setRollUnder(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded w-28"/>
				<input type="number" value={bet} onChange={(e)=>setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"/>
				<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Roll</button>
			</div>
		</div>
	);
}