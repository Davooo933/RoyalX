import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const games = await prisma.game.findMany({ orderBy: { createdAt: "asc" } });
	return NextResponse.json({ games });
}

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { key, name, category } = (await req.json()) as { key: string; name?: string; category?: string };
	const game = await prisma.game.upsert({ where: { key }, create: { key, name: name || key, category: (category as any) || "MINI" }, update: {} });
	return NextResponse.json({ game });
}

export async function PUT(req: NextRequest) {
	const session = await getSession();
	if (!session.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const { key, isEnabled, rtpTarget } = (await req.json()) as { key: string; isEnabled?: boolean; rtpTarget?: number };
	const game = await prisma.game.update({ where: { key }, data: { isEnabled, rtpTarget } });
	return NextResponse.json({ game });
}