import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const refresh = async () => {
    const r = await fetch('http://localhost:5175/api/admin/stats')
    const d = await r.json()
    setStats(d)
  }
  useEffect(() => { refresh() }, [])
  if (!stats) return <div className="lux-card p-4">Loading...</div>
  return (
    <div className="lux-card p-6">
      <div className="text-xl font-semibold mb-2">Admin Dashboard</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Casino Reserve</div><div className="lux-gold-text">${stats.casinoReserve.toFixed(2)}</div>
        <div>Total Wagered</div><div>${stats.totalWagered.toFixed(2)}</div>
        <div>Total Payout</div><div>${stats.totalPayout.toFixed(2)}</div>
        <div>RTP Actual</div><div>{(stats.rtpActual * 100).toFixed(2)}%</div>
        <div>Target Win Rate</div><div>{(stats.targetWinRate * 100).toFixed(0)}%</div>
        <div>Target House Edge</div><div>{(stats.targetHouseEdge * 100).toFixed(0)}%</div>
      </div>
    </div>
  )
}

