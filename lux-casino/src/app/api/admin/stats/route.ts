import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const [users, balanceAgg, wageredAgg, paidAgg] = await Promise.all([
		prisma.user.count(),
		prisma.wallet.aggregate({ _sum: { balance: true } }),
		prisma.rTPController.aggregate({ _sum: { currentWagered: true } }),
		prisma.rTPController.aggregate({ _sum: { currentPaid: true } }),
	]);
	return NextResponse.json({
		users,
		totalBalance: Number(balanceAgg._sum.balance || 0),
		wagered: Number(wageredAgg._sum.currentWagered || 0),
		paid: Number(paidAgg._sum.currentPaid || 0),
	});
}