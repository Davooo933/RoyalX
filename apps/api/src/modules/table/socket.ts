import type { Server, Socket } from 'socket.io';
import { z } from 'zod';

export function registerTableNamespace(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('sit', (payload: any) => {
      const schema = z.object({ tableId: z.string(), buyInMinor: z.string().regex(/^\d+$/) });
      const p = schema.safeParse(payload);
      if (!p.success) return socket.emit('error', { message: 'invalid' });
      socket.join(`table:${p.data.tableId}`);
      socket.emit('state', { ok: true });
    });

    socket.on('chat', (payload: any) => {
      const schema = z.object({ tableId: z.string(), text: z.string().min(1).max(280) });
      const p = schema.safeParse(payload);
      if (!p.success) return socket.emit('error', { message: 'invalid' });
      io.to(`table:${p.data.tableId}`).emit('chat', { userId: socket.id, text: p.data.text });
    });
  });
}

