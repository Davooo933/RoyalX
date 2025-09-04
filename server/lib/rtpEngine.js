const { randomInt } = require('crypto');

// Target parameters
const TARGET_PLAYER_WIN_RATE = 0.30; // 30% win probability
const TARGET_RTP = 1 - 0.70; // RTP (return to player) = 30%

// Initial casino reserve
const INITIAL_RESERVE = 50; // USD

function initEngineState() {
  return {
    casinoReserve: INITIAL_RESERVE,
    totalWagered: 0,
    totalPayout: 0,
    players: {},
    rtpWindow: [], // track last N outcomes for smoothing
    windowSize: 500,
  };
}

function getStats(state) {
  const rtpActual = state.totalWagered > 0 ? state.totalPayout / state.totalWagered : 0;
  return {
    casinoReserve: state.casinoReserve,
    totalWagered: state.totalWagered,
    totalPayout: state.totalPayout,
    rtpActual,
    targetWinRate: TARGET_PLAYER_WIN_RATE,
    targetHouseEdge: 1 - TARGET_RTP,
    rtpWindowSample: state.rtpWindow.slice(-10),
  };
}

function pickWin(targetWinRate, currentWinRate) {
  // Feedback control: if currentWinRate > target, reduce win chance; else increase a bit
  const error = (targetWinRate - currentWinRate);
  const adjusted = Math.min(0.95, Math.max(0.05, targetWinRate + error * 0.5));
  return Math.random() < adjusted;
}

function clampPayoutForReserve(reserve, desiredPayout) {
  return Math.max(0, Math.min(reserve, desiredPayout));
}

function settleBet(state, { playerId, gameId, betAmount, params = {} }) {
  if (!playerId) throw new Error('Missing playerId');
  if (!gameId) throw new Error('Missing gameId');
  const bet = Number(betAmount || 0);
  if (!Number.isFinite(bet) || bet <= 0) throw new Error('Invalid bet amount');

  const player = state.players[playerId];
  if (!player) throw new Error('Unknown player');
  if (player.balance < bet) throw new Error('Insufficient player balance');

  // Calculate rolling win rate
  const winsInWindow = state.rtpWindow.filter(x => x.win).length;
  const currentWinRate = state.rtpWindow.length > 0 ? winsInWindow / state.rtpWindow.length : TARGET_PLAYER_WIN_RATE;

  // Decide win or loss using feedback control around target 30%
  const didWin = pickWin(TARGET_PLAYER_WIN_RATE, currentWinRate);

  // Effective win probability used for this decision (estimate for payout calc)
  const effectiveWinProb = Math.max(0.05, Math.min(0.95, currentWinRate === 0 ? TARGET_PLAYER_WIN_RATE : (TARGET_PLAYER_WIN_RATE + (TARGET_PLAYER_WIN_RATE - currentWinRate) * 0.5)));

  const key = String(gameId).toLowerCase();

  // Compute payout to maintain RTP: E[payout] = RTP * bet
  // If win occurs, payout_on_win = (RTP * bet) / effectiveWinProb
  const desiredPayout = didWin ? (TARGET_RTP * bet) / effectiveWinProb : 0;

  // Add small game flavor variance without changing expectation materially
  const flavor = gameFlavorMultiplier(key);
  const flavoredDesired = didWin ? desiredPayout * flavor : 0;

  // Reserve protection
  const payout = clampPayoutForReserve(state.casinoReserve, flavoredDesired);

  // If payout is 0 due to reserve constraints, treat as loss
  const finalWin = didWin && payout > 0;

  // Update balances
  player.balance -= bet;
  state.casinoReserve += bet;
  state.totalWagered += bet;
  player.totalWagered = (player.totalWagered || 0) + bet;

  if (finalWin) {
    player.balance += payout;
    state.casinoReserve -= payout;
    state.totalPayout += payout;
    player.totalWon = (player.totalWon || 0) + payout;
  }

  // Track window
  state.rtpWindow.push({ win: finalWin, bet, payout });
  if (state.rtpWindow.length > state.windowSize) state.rtpWindow.shift();

  // Outcome payload per game can include symbols/rolls etc.
  const visuals = generateGameVisuals(key, finalWin, { bet, params });

  return {
    updatedState: state,
    result: {
      win: finalWin,
      bet,
      payout: finalWin ? payout : 0,
      multiplier: finalWin ? payout / bet : 0,
      visuals,
    },
  };
}

function gameFlavorMultiplier(gameKey) {
  // Keep multiplier near 1.0 to not skew RTP too much
  const base = {
    'blackjack': 1.05,
    'roulette': 0.95,
    'coinflip': 1.0,
    'dice': 1.1,
    'plinko': 0.9,
    'crash': 1.15,
    'wheel': 1.0,
    'slots': 1.05,
    'hilo': 1.0,
    'double': 0.95,
    'bins': 1.0,
    'book-of-ra': 1.1,
    'gates-of-olympus': 1.15,
    'lucky-ladys-charm': 1.05,
    'the-money-game': 0.95,
    '3-coins-egypt': 1.0,
    'gonzos-quest-touch': 1.1,
    'fruit-cocktail': 0.9,
    'ghost-pirates': 1.05,
  };
  return base[gameKey] || 1.0;
}

function generateGameVisuals(gameKey, win, ctx) {
  switch (gameKey) {
    case 'coinflip':
      return { coin: Math.random() < 0.5 ? 'heads' : 'tails', physicsSeed: randomInt(1e9) };
    case 'dice':
      return { dice: [1 + randomInt(6), 1 + randomInt(6)], physicsSeed: randomInt(1e9) };
    case 'wheel':
      return { segment: randomInt(24), physicsSeed: randomInt(1e9) };
    case 'plinko':
      return { row: 12, column: randomInt(13), physicsSeed: randomInt(1e9) };
    default:
      return { reels: [randomInt(10), randomInt(10), randomInt(10)], win };
  }
}

module.exports = { initEngineState, settleBet, getStats };

