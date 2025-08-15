"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

const variants: Record<string, { key: string; name: string }> = {
	"gates-of-olympus": { key: "SLOT_GATES_OF_OLYMPUS", name: "Gates of Olympus" },
	"lucky-ladys-charm": { key: "SLOT_LUCKY_LADYS_CHARM", name: "Lucky Lady’s Charm" },
	"book-of-ra": { key: "SLOT_BOOK_OF_RA", name: "Book Of Ra" },
	"the-money-game": { key: "SLOT_THE_MONEY_GAME", name: "The Money Game" },
	"3-coins-egypt": { key: "SLOT_3_COINS_EGYPT", name: "3 Coins Egypt" },
	"gonzos-quest-touch": { key: "SLOT_GONZOS_QUEST_TOUCH", name: "Gonzo’s Quest Touch" },
	"fruit-cocktail": { key: "SLOT_FRUIT_COCKTAIL", name: "Fruit Cocktail" },
	"ghost-pirates": { key: "SLOT_GHOST_PIRATES", name: "Ghost Pirates" },
};

export default function SlotVariantPage(props: any) {
	const slug = props?.params?.variant as string;
	const variant = variants[slug];
	const [bet, setBet] = useState(1);
	const [spinning, setSpinning] = useState(false);
	const [last, setLast] = useState<any>(null);
	const { connected } = useSocket();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		const c = canvasRef.current; if (!c) return; const ctx = c.getContext("2d"); if (!ctx) return;
		let t = 0; const symbols = ["A","K","Q","J","10","9","★","Ω","$","7"];
		const draw = () => {
			const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
			ctx.fillStyle = "#0b0b0b"; ctx.fillRect(0,0,w,h);
			for(let col=0; col<3; col++){
				for(let row=0; row<3; row++){
					const x = 50 + col*120; const y = 60 + row*100 + ((t+col*10)%100);
					ctx.fillStyle = "#111"; ctx.fillRect(x-40,y-40,80,80);
					ctx.strokeStyle = "#333"; ctx.strokeRect(x-40,y-40,80,80);
					ctx.fillStyle = "#FFD700";
					ctx.font = "28px sans-serif";
					const s = symbols[(row+col+Math.floor(t/5))%symbols.length];
					ctx.fillText(s, x-10, y);
				}
			}
			t += spinning ? 4 : 0.5;
			animRef.current = requestAnimationFrame(draw);
		};
		draw();
		return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
	}, [spinning]);

	async function spin() {
		if (!variant) return;
		setSpinning(true);
		const res = await fetch("/api/games/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ betAmount: bet, variantKey: variant.key }) });
		const data = await res.json();
		setLast(data);
		setTimeout(() => setSpinning(false), 800);
	}

	if (!variant) {
		return <div className="min-h-screen bg-black text-white p-8">Variant not found</div>;
	}

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl mb-1">{variant.name}</h1>
			<div className="text-sm text-zinc-400 mb-4">{connected ? "Live" : "Offline"}</div>
			<canvas ref={canvasRef} width={480} height={380} className="w-full max-w-lg rounded-xl border border-amber-500/30 bg-zinc-950 mb-4" />
			<div className="flex gap-3">
				<input type="number" value={bet} onChange={(e)=>setBet(Number(e.target.value))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"/>
				<button disabled={spinning} onClick={spin} className="px-4 py-2 bg-amber-500 text-black rounded">{spinning?"Spinning":"Spin"}</button>
			</div>
			{last && (
				<div className="mt-4 text-sm text-zinc-300">{last.win?"Win":"Loss"} • Multiplier {last.payoutMultiplier?.toFixed?.(2)} • Payout {last.payout?.toFixed?.(2)}</div>
			)}
		</div>
	);
}