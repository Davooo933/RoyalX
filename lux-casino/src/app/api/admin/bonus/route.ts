import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { userId, amount } = (await req.json()) as { userId: string; amount: number };
	if (!userId || !amount || amount <= 0) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	const wallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
	if (!wallet) return NextResponse.json({ error: "User has no wallet" }, { status: 400 });
	await prisma.$transaction([
		prisma.bonus.create({ data: { userId, type: "CASH", amount, status: "CLAIMED", createdById: session.user.id } }),
		prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } }),
		prisma.transaction.create({ data: { userId, walletId: wallet.id, type: "BONUS", status: "CONFIRMED", amount, currency: "USDT" } }),
	]);
	return NextResponse.json({ ok: true });
}