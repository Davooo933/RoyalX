import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { email, password, name } = body as { email: string; password: string; name?: string };
	if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

	const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
	const role = adminEmails.includes(email.toLowerCase()) ? "ADMIN" : "USER";

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({ data: { email, name, passwordHash, role: role as any } });
	return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}