import { NextRequest } from "next/server";
import { getIoServer } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
	// This route initializes Socket.IO server when first hit in runtime
	// In production, hook into custom server for persistent websockets
	(getIoServer as any)((global as any).server);
	return new Response("ok");
}