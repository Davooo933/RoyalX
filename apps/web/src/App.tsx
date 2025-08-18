import React from 'react';

function App() {
  return (
    <div style={{padding:20, color:'#e5e7eb', background:'#0b0b10', minHeight:'100vh'}}>
      <h1>Luxury Poker</h1>
      <p>Web + API skeleton is up.</p>
      <button
        onClick={() => fetch('/api/health').then(r=>r.json()).then(a=>alert(JSON.stringify(a)))}
        style={{
          background: '#0f0f12',
          color: '#e5e7eb',
          borderRadius: 12,
          padding: '10px 16px',
          border: '1px solid #2a2a33',
          boxShadow: '0 0 12px rgba(0,255,200,0.25)'
        }}
      >
        Check API
      </button>
    </div>
  );
}

export default App;

import React from react;
import { PokerButton } from @poker/ui;

function App() {
  return (
    <div style={{padding:20, color:#e5e7eb, background:#0b0b10, minHeight:100vh}}>
      <h1>Luxury Poker</h1>
      <p>Web + API skeleton is up.</p>
      <PokerButton onClick={() => fetch(/api/health).then(r=>r.json()).then(a=>alert(JSON.stringify(a)))}>Check API</PokerButton>
    </div>
  );
}

export default App;
