import { Server as IOServer } from "socket.io";
import type { Socket } from "socket.io";

let io: IOServer | null = null;

export function getIoServer(server?: any) {
	if (io) return io;
	if (!server) return null;
	io = new IOServer(server, { cors: { origin: "*" } });
	io.on("connection", (socket: Socket) => {
		socket.on("join", (room: string) => socket.join(room));
	});
	return io;
}