import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { transferUsdt } from "@/lib/tron";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { limit } = (await req.json().catch(() => ({}))) as { limit?: number };
	const pending = await prisma.transaction.findMany({ where: { type: "WITHDRAWAL", status: "PENDING" }, take: Math.min(10, limit || 5), orderBy: { createdAt: "asc" } });
	const results: any[] = [];
	for (const t of pending) {
		const to = (t.metaJson as any)?.toAddress as string;
		try {
			const txHash = await transferUsdt(to, String(t.amount));
			await prisma.$transaction([
				prisma.transaction.update({ where: { id: t.id }, data: { status: "CONFIRMED", txHash } }),
				prisma.wallet.update({ where: { id: t.walletId! }, data: { locked: { decrement: Number(t.amount) } } }),
			]);
			results.push({ id: t.id, ok: true, txHash });
		} catch (e: any) {
			await prisma.transaction.update({ where: { id: t.id }, data: { status: "FAILED" } });
			results.push({ id: t.id, ok: false, error: e.message });
		}
	}
	return NextResponse.json({ processed: results.length, results });
}