"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
	const socketRef = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);
	useEffect(() => {
		const s = io({ path: "/api/socketio" });
		socketRef.current = s;
		s.on("connect", () => setConnected(true));
		s.on("disconnect", () => setConnected(false));
		return () => {
			s.disconnect();
			socketRef.current = null;
		};
	}, []);
	return { socket: socketRef.current, connected };
}