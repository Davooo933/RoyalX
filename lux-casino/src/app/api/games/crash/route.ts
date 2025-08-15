import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { playRtpRound } from "@/lib/gameEngine";
import { decideWinWithRtp } from "@/lib/rtp";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, cashoutAt } = (await req.json()) as { betAmount: number; cashoutAt: number };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	try {
		const outcome = await playRtpRound({
			gameKey: "CRASH",
			userId: session.user.id,
			betAmount,
			buildOutcome: ({ betAmount, targetRtp, currentPaid, currentWagered }) => {
				const win = decideWinWithRtp({ wager: betAmount, currentWagered, currentPaid, targetRtp, baseWinChance: 0.3 });
				const multiplier = win ? Math.max(1.01, cashoutAt || 2.0) : 0;
				return { win, payout: win ? betAmount * multiplier : 0, payoutMultiplier: multiplier, result: { win, multiplier } };
			},
		});
		return NextResponse.json(outcome);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}