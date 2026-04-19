import React, { useState } from 'react';
import '../styles/App.css';

const TOPIC_IDEAS = [
  'AI will replace artists',
  'Social media does more harm than good',
  'Remote work is better than office',
  'Space exploration is a waste of money',
  'Cryptocurrency is the future of money',
  'Nuclear energy is necessary for climate',
];

export default function Home({ createRoom, joinRoom, error, setError }) {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [code, setCode] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!topic.trim()) return setError('Please enter a debate topic.');
    createRoom(name.trim(), topic.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (code.trim().length !== 4) return setError('Please enter a valid 4-digit room code.');
    joinRoom(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-ornament">⚔</div>
        <div className="logo">
          <h1 className="logo-title">Duel of Minds</h1>
          <p className="logo-sub">The Debate Arena</p>
        </div>
        <p className="home-tagline">Two debaters. Three rounds. One winner.</p>
      </header>

      {error && <div className="error-banner page-error animate-fade-in">{error}</div>}

      {!mode ? (
        <div className="home-panels animate-fade-up">
          <div className="home-panel" onClick={() => setMode('create')} style={{ cursor: 'pointer' }}>
            <div className="panel-title">
              <span className="icon">🏛</span> Create Room
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Set the debate topic and receive a 4-digit code to share with your opponent.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => setMode('create')}>
              Create Arena
            </button>
          </div>

          <div className="home-panel" onClick={() => setMode('join')} style={{ cursor: 'pointer' }}>
            <div className="panel-title">
              <span className="icon">🗡</span> Join Room
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Enter the 4-digit code your opponent shared and step into the arena.
            </p>
            <button className="btn btn-outline btn-full" onClick={() => setMode('join')}>
              Enter Arena
            </button>
          </div>
        </div>
      ) : mode === 'create' ? (
        <div className="home-panels animate-fade-up" style={{ display: 'block', maxWidth: '440px' }}>
          <div className="home-panel">
            <div className="panel-title">
              <span className="icon">🏛</span> Create Arena
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={24}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Debate Topic</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. AI will replace all jobs"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  maxLength={120}
                />
                <div className="topic-ideas">
                  {TOPIC_IDEAS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className="topic-chip"
                      onClick={() => setTopic(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Room
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setMode(null); setError(null); }}>
                  ← Back
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="home-panels animate-fade-up" style={{ display: 'block', maxWidth: '440px' }}>
          <div className="home-panel">
            <div className="panel-title">
              <span className="icon">🗡</span> Join Arena
            </div>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={24}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Room Code</label>
                <input
                  className="input input-code"
                  type="text"
                  placeholder="0000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-outline" style={{ flex: 1 }}>
                  Join Room
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setMode(null); setError(null); }}>
                  ← Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '3rem', color: 'var(--text-faint)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
        Powered by Groq &amp; Llama 3 · Real-time via Socket.io
      </footer>
    </div>
  );
}
