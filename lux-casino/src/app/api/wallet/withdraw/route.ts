import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { toAddress, amount } = await req.json();
	const userId = session.user.id;
	const wallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
	if (!wallet) return NextResponse.json({ error: "No wallet" }, { status: 400 });
	const amt = Number(amount);
	if (!toAddress || isNaN(amt) || amt <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
	if (Number(wallet.balance) < amt) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
	await prisma.$transaction([
		prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amt }, locked: { increment: amt } } }),
		prisma.transaction.create({
			data: {
				userId,
				walletId: wallet.id,
				type: "WITHDRAWAL",
				status: "PENDING",
				amount: amt,
				currency: wallet.currency,
				chain: wallet.chain,
				metaJson: { toAddress },
			},
		}),
	]);
	return NextResponse.json({ ok: true });
}