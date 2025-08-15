import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { playRtpRound, binsOutcome } from "@/lib/gameEngine";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, bin } = (await req.json()) as { betAmount: number; bin?: number };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	try {
		const outcome = await playRtpRound({ gameKey: "BINS", userId: session.user.id, betAmount, buildOutcome: binsOutcome, payload: { bin } });
		return NextResponse.json(outcome);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}