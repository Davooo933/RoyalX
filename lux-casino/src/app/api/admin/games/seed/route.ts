import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const variants = [
	{ key: "SLOT_GATES_OF_OLYMPUS", name: "Gates of Olympus", weights: [0,0,0.5,1,2,5,10,20,50,100] },
	{ key: "SLOT_LUCKY_LADYS_CHARM", name: "Lucky Lady’s Charm", weights: [0,0,0.3,1,2,3,5,10,20,50] },
	{ key: "SLOT_BOOK_OF_RA", name: "Book Of Ra", weights: [0,0,0.2,1,2,5,8,15,30,80] },
	{ key: "SLOT_THE_MONEY_GAME", name: "The Money Game", weights: [0,0,0.4,1,2,4,6,12,24,60] },
	{ key: "SLOT_3_COINS_EGYPT", name: "3 Coins Egypt", weights: [0,0,0.5,1,2,5,7,12,18,40] },
	{ key: "SLOT_GONZOS_QUEST_TOUCH", name: "Gonzo’s Quest Touch", weights: [0,0,0.1,1,2,6,12,25,50,120] },
	{ key: "SLOT_FRUIT_COCKTAIL", name: "Fruit Cocktail", weights: [0,0,0.7,1,2,3,4,6,10,20] },
	{ key: "SLOT_GHOST_PIRATES", name: "Ghost Pirates", weights: [0,0,0.2,1,2,4,8,16,32,64] },
];

export async function POST() {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	for (const v of variants) {
		await prisma.game.upsert({ where: { key: v.key }, update: { name: v.name, category: "SLOT" as any }, create: { key: v.key, name: v.name, category: "SLOT" as any, isEnabled: true } });
		const game = await prisma.game.findUnique({ where: { key: v.key } });
		if (!game) continue;
		const existing = await prisma.rTPController.findFirst({ where: { gameId: game.id } });
		if (existing) {
			await prisma.rTPController.update({ where: { id: existing.id }, data: { targetRtp: 0.3, configJson: { weights: v.weights } } });
		} else {
			await prisma.rTPController.create({ data: { gameId: game.id, targetRtp: 0.3, configJson: { weights: v.weights } } });
		}
	}
	return NextResponse.json({ ok: true, variants: variants.length });
}