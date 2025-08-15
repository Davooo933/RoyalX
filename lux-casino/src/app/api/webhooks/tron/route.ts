import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null) {
	const secret = process.env.TRON_WEBHOOK_SECRET || "";
	if (!secret) return false;
	if (!signature) return false;
	const h = crypto.createHmac("sha256", secret).update(body).digest("hex");
	return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
	const raw = await req.text();
	const sig = req.headers.get("x-tron-signature");
	if (!verifySignature(raw, sig)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { txHash, toAddress, amount } = JSON.parse(raw) as { txHash: string; toAddress: string; amount: number };
	if (!txHash || !toAddress || !amount || amount <= 0) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	const wallet = await prisma.wallet.findUnique({ where: { address: toAddress } });
	if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
	const exists = await prisma.transaction.findFirst({ where: { txHash } });
	if (exists) return NextResponse.json({ ok: true });
	await prisma.$transaction([
		prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } }),
		prisma.transaction.create({ data: { userId: wallet.userId, walletId: wallet.id, type: "DEPOSIT", status: "CONFIRMED", amount, currency: wallet.currency, chain: wallet.chain, txHash } }),
	]);
	return NextResponse.json({ ok: true });
}