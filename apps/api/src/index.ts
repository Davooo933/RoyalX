import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerTableNamespace } from './modules/table/socket';
import { geoBlock, responsibleGamingHeaders } from './middleware/compliance';
import { simpleRateLimit } from './middleware/rateLimit';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(geoBlock());
app.use(responsibleGamingHeaders());
app.use(simpleRateLimit());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/login', (req, res) => {
  const schema = z.object({ token: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid' });
  return res.json({ jwt: 'stub.jwt.token', user: { id: 'u_1', email: 'stub@example.com' } });
});

app.get('/lobby', async (_req, res) => {
  res.json({ tables: [] });
});

// Tables (stubs)
app.post('/tables', (req, res) => {
  const schema = z.object({
    name: z.string().min(3),
    blinds: z.object({ small: z.number().int().positive(), big: z.number().int().positive() }),
    maxSeats: z.number().int().min(2).max(9),
    private: z.boolean().optional(),
    password: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid' });
  const id = 'tbl_' + Math.random().toString(36).slice(2, 10);
  res.status(201).json({ id });
});

app.post('/tables/:id/join', (req, res) => {
  const params = z.object({ id: z.string().min(1) }).parse(req.params);
  const seat = { seatIndex: 0, stackMinor: 0 };
  res.json({ ok: true, tableId: params.id, seat });
});

app.post('/tables/:id/leave', (req, res) => {
  const params = z.object({ id: z.string().min(1) }).parse(req.params);
  res.json({ ok: true, tableId: params.id });
});

app.get('/history/:tableId', (req, res) => {
  const params = z.object({ tableId: z.string().min(1) }).parse(req.params);
  const cursor = z.string().optional().parse(req.query.cursor as any);
  res.json({ tableId: params.tableId, cursor: cursor ?? null, items: [] });
});

// Wallet (stubs)
app.post('/wallet/deposit/address', (req, res) => {
  const chain = (req.body?.chain as string) || 'TRON';
  if (chain !== 'TRON' && chain !== 'ETH') return res.status(400).json({ error: 'unsupported chain' });
  const address = chain === 'TRON' ? 'T' + Math.random().toString(36).slice(2, 9) : '0x' + Math.random().toString(16).slice(2, 10);
  res.json({ chain, address });
});

app.get('/wallet/balance', async (_req, res) => {
  res.json({ usdtMinor: '0' });
});

app.post('/wallet/withdraw', (req, res) => {
  const schema = z.object({ chain: z.enum(['TRON','ETH']), to: z.string().min(4), amountMinor: z.string().regex(/^\d+$/) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid' });
  const id = 'wd_' + Math.random().toString(36).slice(2, 10);
  res.status(201).json({ id, status: 'pending' });
});

app.post('/webhooks/erc20', (req, res) => {
  res.json({ ok: true });
});

app.post('/webhooks/trc20', (req, res) => {
  res.json({ ok: true });
});

registerTableNamespace(io);

const port = Number(process.env.PORT || 8080);
httpServer.listen(port, () => {
  console.log(`API listening on :${port}`);
});

import dotenv/config;
import express from express;
import cors from cors;
import helmet from helmet;
import morgan from morgan;
import { createServer } from http;
import { Server as SocketIOServer } from socket.io;
import { z } from zod;

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(dev));

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: * } });

app.get(/health, (_req, res) => res.json({ ok: true }));

app.post(/auth/login, (req, res) => {
  const schema = z.object({ token: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: invalid });
  return res.json({ jwt: stub.jwt.token, user: { id: u_1, email: stub@example.com } });
});

app.get(/lobby, async (_req, res) => {
  res.json({ tables: [] });
});

io.on(connection, (socket) => {
  socket.on(joinTable, (tableId: string) => {
    socket.join(`table:${tableId}`);
    socket.emit(state, { ok: true, tableId });
  });
});

const port = Number(process.env.PORT || 8080);
httpServer.listen(port, () => {
  console.log(`API listening on :${port}`);
});
