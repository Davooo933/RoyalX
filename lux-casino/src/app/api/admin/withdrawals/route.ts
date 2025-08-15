import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
// import { transferUsdt } from "@/lib/tron";

export async function GET() {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const txs = await prisma.transaction.findMany({ where: { type: "WITHDRAWAL", status: "PENDING" }, orderBy: { createdAt: "asc" } });
	return NextResponse.json({ pending: txs });
}

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { transactionId, txHash } = (await req.json()) as { transactionId: string; txHash?: string };
	const txRow = await prisma.transaction.findUnique({ where: { id: transactionId } });
	if (!txRow || txRow.status !== "PENDING") return NextResponse.json({ error: "Invalid transaction" }, { status: 400 });
	const wallet = await prisma.wallet.findUnique({ where: { id: txRow.walletId! } });
	if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
	await prisma.$transaction([
		prisma.transaction.update({ where: { id: txRow.id }, data: { status: "CONFIRMED", txHash } }),
		prisma.wallet.update({ where: { id: wallet.id }, data: { locked: { decrement: Number(txRow.amount) } } }),
	]);
	return NextResponse.json({ ok: true });
}