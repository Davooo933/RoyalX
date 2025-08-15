import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { getBus } from "@/lib/bus";

export const config = {
	api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const anyRes = res as any;
	if (!anyRes.socket.server.io) {
		const io = new IOServer(anyRes.socket.server, {
			path: "/api/socketio",
			cors: { origin: "*" },
		});
		anyRes.socket.server.io = io;
		const bus = getBus();
		const forward = (payload: any) => io.emit("game_event", payload);
		bus.on("game_event", forward);
		io.on("connection", (socket) => {
			socket.on("join", (room: string) => socket.join(room));
			socket.on("disconnect", () => {});
		});
	}
	res.end();
}