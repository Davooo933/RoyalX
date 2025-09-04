const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const { nanoid } = require('nanoid');

const { settleBet, getStats, initEngineState } = require('./lib/rtpEngine');

const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

async function ensureStateFile() {
  await fs.ensureDir(DATA_DIR);
  if (!(await fs.pathExists(STATE_FILE))) {
    const initial = initEngineState();
    await fs.writeJSON(STATE_FILE, initial, { spaces: 2 });
  }
}

async function readState() {
  await ensureStateFile();
  return await fs.readJSON(STATE_FILE);
}

async function writeState(state) {
  await fs.writeJSON(STATE_FILE, state, { spaces: 2 });
}

async function start() {
  await ensureStateFile();
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  app.use(cors());
  app.use(express.json());

  // Simple in-memory sessions for demo
  app.post('/api/login', async (req, res) => {
    const { name } = req.body || {};
    const state = await readState();
    const playerId = nanoid();
    state.players[playerId] = {
      id: playerId,
      name: name || `Player-${playerId.slice(0, 5)}`,
      balance: 100, // give demo balance
      totalWagered: 0,
      totalWon: 0,
    };
    await writeState(state);
    res.json({ player: state.players[playerId], casino: { reserve: state.casinoReserve } });
  });

  app.get('/api/state', async (_req, res) => {
    const state = await readState();
    res.json({
      casinoReserve: state.casinoReserve,
      totalWagered: state.totalWagered,
      totalPayout: state.totalPayout,
      rtpActual: state.totalWagered > 0 ? state.totalPayout / state.totalWagered : 0,
      players: Object.values(state.players).map(p => ({ id: p.id, name: p.name, balance: p.balance })),
    });
  });

  app.get('/api/admin/stats', async (_req, res) => {
    const state = await readState();
    res.json(getStats(state));
  });

  app.post('/api/bet', async (req, res) => {
    const { playerId, gameId, betAmount, params } = req.body || {};
    try {
      const state = await readState();
      const { updatedState, result } = settleBet(state, { playerId, gameId, betAmount, params });
      await writeState(updatedState);
      io.emit('balances:update', {
        casinoReserve: updatedState.casinoReserve,
        players: { [playerId]: updatedState.players[playerId].balance },
        totalWagered: updatedState.totalWagered,
        totalPayout: updatedState.totalPayout,
        rtpActual: updatedState.totalWagered > 0 ? updatedState.totalPayout / updatedState.totalWagered : 0,
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message || 'Bet failed' });
    }
  });

  io.on('connection', async (socket) => {
    const state = await readState();
    socket.emit('state:init', {
      casinoReserve: state.casinoReserve,
      totalWagered: state.totalWagered,
      totalPayout: state.totalPayout,
      rtpActual: state.totalWagered > 0 ? state.totalPayout / state.totalWagered : 0,
    });

    socket.on('bet:place', async (payload, cb) => {
      try {
        const state2 = await readState();
        const { updatedState, result } = settleBet(state2, payload);
        await writeState(updatedState);
        io.emit('balances:update', {
          casinoReserve: updatedState.casinoReserve,
          players: { [payload.playerId]: updatedState.players[payload.playerId].balance },
          totalWagered: updatedState.totalWagered,
          totalPayout: updatedState.totalPayout,
          rtpActual: updatedState.totalWagered > 0 ? updatedState.totalPayout / updatedState.totalWagered : 0,
        });
        cb && cb({ ok: true, result });
      } catch (err) {
        cb && cb({ ok: false, error: err.message || 'Bet failed' });
      }
    });
  });

  const PORT = process.env.PORT || 5175;
  server.listen(PORT, () => {
    console.log(`Casino server listening on :${PORT}`);
  });
}

start();

