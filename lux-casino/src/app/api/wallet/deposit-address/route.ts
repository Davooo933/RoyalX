import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createTronAccount } from "@/lib/tron";

export async function GET() {
	const session = await getSession();
	if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const userId = session.user.id;
	let wallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
	if (!wallet) {
		const acct = await createTronAccount();
		wallet = await prisma.wallet.create({
			data: {
				userId,
				currency: "USDT",
				chain: "TRON",
				address: acct.address.base58,
				privateKey: acct.privateKey,
			},
		});
	}
	return NextResponse.json({ address: wallet.address });
}