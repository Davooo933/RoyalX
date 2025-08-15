import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { playRtpRound, wheelOutcome } from "@/lib/gameEngine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, segments } = (await req.json()) as { betAmount: number; segments?: number[] };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	try {
		const outcome = await playRtpRound({ gameKey: "WHEEL", userId: session.user.id, betAmount, buildOutcome: wheelOutcome, payload: { segments } });
		return NextResponse.json(outcome);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}