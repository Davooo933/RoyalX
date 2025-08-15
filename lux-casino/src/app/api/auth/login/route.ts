import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { email, password } = body as { email: string; password: string };
	if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

	const session = await getSession();
	session.user = { id: user.id, email: user.email, role: user.role as any };
	await session.save();
	return NextResponse.json({ ok: true });
}