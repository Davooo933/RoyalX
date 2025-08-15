import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { playRtpRound, hiloOutcome } from "@/lib/gameEngine";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, choice } = (await req.json()) as { betAmount: number; choice?: string };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	try {
		const outcome = await playRtpRound({ gameKey: "HILO", userId: session.user.id, betAmount, buildOutcome: hiloOutcome, payload: { choice } });
		return NextResponse.json(outcome);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}