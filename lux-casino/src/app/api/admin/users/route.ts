import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { searchParams } = new URL(req.url);
	const q = searchParams.get("q") || "";
	const users = await prisma.user.findMany({
		where: q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {},
		orderBy: { createdAt: "desc" },
		take: 50,
	});
	return NextResponse.json({ users });
}

export async function PUT(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { userId, action, amount } = (await req.json()) as { userId: string; action: string; amount?: number };
	if (action === "SUSPEND") {
		await prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
		return NextResponse.json({ ok: true });
	}
	if (action === "UNSUSPEND") {
		await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
		return NextResponse.json({ ok: true });
	}
	if (action === "ADJUST") {
		const wallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
		if (!wallet || !amount || amount === 0) return NextResponse.json({ error: "Invalid" }, { status: 400 });
		await prisma.$transaction([
			prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } }),
			prisma.transaction.create({ data: { userId, walletId: wallet.id, type: "ADJUSTMENT", status: "CONFIRMED", amount, currency: wallet.currency, chain: wallet.chain } }),
		]);
		return NextResponse.json({ ok: true });
	}
	return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}