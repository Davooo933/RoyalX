import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'
import { Howl } from 'howler'
import './index.css'
import AdminDashboard from './components/AdminDashboard'

const socket = io('http://localhost:5175', { transports: ['websocket'] })

const bgHowl = new Howl({
  src: ['https://cdn.pixabay.com/download/audio/2022/03/29/audio_1e89a8a7a0.mp3?filename=soft-ambient-110241.mp3'],
  loop: true,
  volume: 0.3,
})

function App() {
  const [player, setPlayer] = useState(null)
  const [casino, setCasino] = useState({ reserve: 0 })
  const [stats, setStats] = useState({ rtpActual: 0, totalWagered: 0, totalPayout: 0 })
  const [bet, setBet] = useState(1)
  const [lastResult, setLastResult] = useState(null)

  useEffect(() => {
    if (!bgHowl.playing()) bgHowl.play()
    const onInit = (s) => setStats({ rtpActual: s.rtpActual, totalWagered: s.totalWagered, totalPayout: s.totalPayout })
    const onBalances = (payload) => {
      setStats((st) => ({ ...st, totalWagered: payload.totalWagered, totalPayout: payload.totalPayout, rtpActual: payload.rtpActual }))
      if (player && payload.players && payload.players[player.id] != null) {
        setPlayer((p) => ({ ...p, balance: payload.players[player.id] }))
      }
      setCasino((c) => ({ ...c, reserve: payload.casinoReserve }))
    }
    socket.on('state:init', onInit)
    socket.on('balances:update', onBalances)
    return () => {
      socket.off('state:init', onInit)
      socket.off('balances:update', onBalances)
    }
  }, [player])

  const login = async () => {
    const r = await fetch('http://localhost:5175/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Guest' }) })
    const data = await r.json()
    setPlayer(data.player)
    setCasino({ reserve: data.casino.reserve })
  }

  const placeBet = async (gameId) => {
    if (!player) return
    const payload = { playerId: player.id, gameId, betAmount: bet, params: {} }
    const r = await fetch('http://localhost:5175/api/bet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await r.json()
    setLastResult({ gameId, ...data })
    const sfx = new Howl({
      src: [data.win ? 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7e745d8226.mp3?filename=success-1-6297.mp3' : 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3b3d43a185.mp3?filename=failure-1-89170.mp3'],
      volume: data.win ? 0.5 : 0.3,
    })
    sfx.play()
  }

  const GameButton = ({ id, label }) => (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => placeBet(id)} className="lux-card px-4 py-3 text-left">
      <div className="text-sm opacity-80">{id}</div>
      <div className="text-xl font-semibold lux-gold-text">{label}</div>
    </motion.button>
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-extrabold lux-gold-text" style={{ fontFamily: 'Cinzel, serif' }}>LUX Casino</div>
          <div className="flex items-center gap-4">
            <div className="text-sm">Casino Reserve: <span className="lux-gold-text">${casino.reserve.toFixed(2)}</span></div>
            {player ? (
              <div className="text-sm">Balance: <span className="lux-gold-text">${player.balance.toFixed(2)}</span></div>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={login} className="px-4 py-2 rounded-full border border-white/20 hover:border-white/40">Enter</motion.button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="lux-card p-6 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="opacity-75 text-sm">Smart RTP</div>
              <div className="text-2xl font-bold">RTP Actual: <span className="lux-gold-text">{(stats.rtpActual * 100).toFixed(1)}%</span></div>
              <div className="opacity-75 text-sm">Wagered: ${stats.totalWagered.toFixed(2)} · Payout: ${stats.totalPayout.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="opacity-75">Bet</span>
              <input type="number" value={bet} min={1} step={1} onChange={(e) => setBet(parseFloat(e.target.value || 0))} className="bg-transparent border border-white/20 rounded px-3 py-2 w-24" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AdminDashboard />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            ['gates-of-olympus','Gates of Olympus'],
            ['lucky-ladys-charm','Lucky Lady’s Charm'],
            ['book-of-ra','Book Of Ra'],
            ['the-money-game','The Money Game'],
            ['3-coins-egypt','3 Coins Egypt'],
            ['gonzos-quest-touch','Gonzo’s Quest Touch'],
            ['fruit-cocktail','Fruit Cocktail'],
            ['ghost-pirates','Ghost Pirates'],
            ['blackjack','Blackjack'],
            ['coinflip','Coinflip'],
            ['crash','Crash Game'],
            ['dice','Dice Game'],
            ['double','Double Game'],
            ['hilo','Hilo Game'],
            ['bins','Bins Game'],
            ['plinko','Plinko Game'],
            ['roulette','Roulette Game'],
            ['slots','Slots Game'],
            ['wheel','Wheel Game'],
          ].map(([id,label]) => (
            <GameButton key={id} id={id} label={label} />
          ))}
        </div>

        <AnimatePresence>
          {lastResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 lux-card p-4">
              <div className="text-sm opacity-75">{lastResult.gameId}</div>
              <div className={`text-xl font-bold ${lastResult.win ? 'text-green-400' : 'text-red-400'}`}>
                {lastResult.win ? `Win +$${lastResult.payout.toFixed(2)}` : 'Loss'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
