"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function PlinkoPage() {
	const [bet, setBet] = useState(1);
	const { connected } = useSocket();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useEffect(()=>{ const c=canvasRef.current; if(!c) return; const ctx=c.getContext("2d"); if(!ctx) return; let y=0; let id=0; const draw=()=>{ const w=c.width,h=c.height; ctx.clearRect(0,0,w,h); ctx.fillStyle="#111"; ctx.fillRect(0,0,w,h); ctx.fillStyle="#FFD700"; for(let i=0;i<8;i++){ for(let j=0;j<=i;j++){ ctx.beginPath(); ctx.arc(w/2 - i*30 + j*60, 100+i*50, 4, 0, Math.PI*2); ctx.fill(); } } ctx.fillStyle="#f55"; ctx.beginPath(); ctx.arc(w/2, y%h, 8, 0, Math.PI*2); ctx.fill(); y+=3; id=requestAnimationFrame(draw); }; draw(); return ()=> cancelAnimationFrame(id); },[]);
	async function play(){ await fetch("/api/games/plinko", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ betAmount:bet }) }); }
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-3">Plinko</h1>
			<div className="text-sm text-zinc-400 mb-2">{connected?"Live":"Offline"}</div>
			<canvas ref={canvasRef} width={600} height={600} className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 mb-4" />
			<div className="flex gap-3">
				<input type="number" value={bet} onChange={(e)=>setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"/>
				<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Bet</button>
			</div>
		</div>
	);
}