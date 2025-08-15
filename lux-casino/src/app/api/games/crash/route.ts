import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ensureRtpController, decideWinWithRtp } from "@/lib/rtp";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { betAmount, cashoutAt } = (await req.json()) as { betAmount: number; cashoutAt: number };
	if (!betAmount || betAmount <= 0) return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
	const userId = session.user.id;
	const gameKey = "CRASH";
	const rtp = await ensureRtpController(gameKey, 0.3);

	const win = decideWinWithRtp({
		wager: betAmount,
		currentWagered: Number(rtp.currentWagered),
		currentPaid: Number(rtp.currentPaid),
		targetRtp: rtp.targetRtp,
		baseWinChance: 0.30,
	});
	const multiplier = win ? Math.max(1.01, cashoutAt || 2.0) : 0;
	const payout = win ? betAmount * multiplier : 0;

	const userWallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
	if (!userWallet) return NextResponse.json({ error: "No wallet" }, { status: 400 });
	if (Number(userWallet.balance) < betAmount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

	const result = await prisma.$transaction(async (tx) => {
		const round = await tx.gameRound.create({
			data: {
				game: { connect: { key: gameKey } },
				user: { connect: { id: userId } },
				betAmount,
				payoutAmount: payout,
				seedServer: "server",
				seedClient: "client",
				nonce: 0,
				resultJson: { win, multiplier },
				status: "SETTLED",
				settledAt: new Date(),
			},
		});
		await tx.bet.create({
			data: {
				roundId: round.id,
				userId,
				amount: betAmount,
				payoutMultiplier: multiplier,
				win,
			},
		});
		await tx.wallet.update({ where: { id: userWallet.id }, data: { balance: { decrement: betAmount } } });
		await tx.transaction.create({
			data: {
				userId,
				walletId: userWallet.id,
				type: "BET",
				status: "CONFIRMED",
				amount: betAmount,
				currency: "USDT",
				metaJson: { game: gameKey },
			},
		});
		if (payout > 0) {
			await tx.wallet.update({ where: { id: userWallet.id }, data: { balance: { increment: payout } } });
			await tx.transaction.create({
				data: {
					userId,
					walletId: userWallet.id,
					type: "PAYOUT",
					status: "CONFIRMED",
					amount: payout,
					currency: "USDT",
					metaJson: { game: gameKey },
				},
			});
		}
		await tx.rTPController.update({
			where: { id: rtp.id },
			data: {
				currentWagered: { increment: betAmount },
				currentPaid: { increment: payout },
			},
		});
		return { win, multiplier, payout };
	});
	return NextResponse.json(result);
}