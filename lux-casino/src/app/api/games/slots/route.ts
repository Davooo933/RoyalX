import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { playRtpRound } from "@/lib/gameEngine";
import { prisma } from "@/lib/db";

function weightedPick(weights: number[]) {
	const sum = weights.reduce((a, b) => a + b, 0);
	let r = Math.random() * sum;
	for (let i = 0; i < weights.length; i++) {
		if ((r -= weights[i]) <= 0) return i;
	}
	return weights.length - 1;
}

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, variantKey } = (await req.json()) as { betAmount: number; variantKey?: string };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	const gameKey = variantKey || "SLOTS";
	try {
		const rtp = await prisma.rTPController.findFirst({ where: { game: { key: gameKey } }, include: { game: true } });
		const weights = (rtp?.configJson as any)?.weights as number[] | undefined;
		const outcome = await playRtpRound({
			gameKey,
			userId: session.user.id,
			betAmount,
			buildOutcome: ({ betAmount, targetRtp, currentWagered, currentPaid }) => {
				const baseWinChance = 0.30;
				const realizedRtp = currentWagered > 0 ? currentPaid / currentWagered : 0;
				const winChance = realizedRtp < targetRtp ? Math.min(0.85, baseWinChance + (targetRtp - realizedRtp) * 0.5) : Math.max(0.05, baseWinChance - (realizedRtp - targetRtp) * 0.5);
				const win = Math.random() < winChance;
				let m = 0;
				if (win) {
					if (weights && weights.length > 0) {
						const idx = weightedPick(weights);
						m = weights[idx];
					} else {
						const multipliers = [0, 0, 0.5, 1, 2, 5, 10, 20, 50, 100];
						m = multipliers[Math.floor(Math.random() * multipliers.length)];
					}
				}
				return { win: m > 1, payout: betAmount * m, payoutMultiplier: m, result: { variantKey: gameKey, multiplier: m } };
			},
		});
		return NextResponse.json(outcome);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}