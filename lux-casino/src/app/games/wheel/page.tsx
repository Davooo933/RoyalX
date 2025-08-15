"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function WheelPage() {
	const [bet, setBet] = useState(1);
	const [segments] = useState<number[]>([1,1,2,3,5,10,20]);
	const { connected } = useSocket();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useEffect(()=>{ const c=canvasRef.current; if(!c)return; const ctx=c.getContext("2d"); if(!ctx)return; let id=0; const draw=()=>{ const w=c.width,h=c.height; ctx.clearRect(0,0,w,h); ctx.translate(w/2,h/2); ctx.rotate(0.01); ctx.translate(-w/2,-h/2); const r=Math.min(w,h)/2-10; for(let i=0;i<segments.length;i++){ ctx.beginPath(); ctx.fillStyle=`hsl(${(i/segments.length)*360},80%,${50+(i%2)*10}%)`; ctx.moveTo(w/2,h/2); ctx.arc(w/2,h/2,r,(i/segments.length)*Math.PI*2,((i+1)/segments.length)*Math.PI*2); ctx.fill(); ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(((i+0.5)/segments.length)*Math.PI*2); ctx.fillStyle="#000"; ctx.fillText(String(segments[i])+'x', r-60, 0); ctx.restore(); } id=requestAnimationFrame(draw); }; draw(); return ()=> cancelAnimationFrame(id); },[segments]);
	async function play(){ await fetch("/api/games/wheel", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ betAmount:bet, segments }) }); }
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-3">Wheel</h1>
			<div className="text-sm text-zinc-400 mb-2">{connected?"Live":"Offline"}</div>
			<canvas ref={canvasRef} width={600} height={600} className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 mb-4" />
			<div className="flex gap-3">
				<input type="number" value={bet} onChange={(e)=>setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"/>
				<button onClick={play} className="px-4 py-2 bg-amber-500 text-black rounded">Bet</button>
			</div>
		</div>
	);
}