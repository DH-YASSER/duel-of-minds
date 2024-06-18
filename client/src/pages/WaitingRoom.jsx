import React, { useState } from 'react';
import '../styles/App.css';

export default function WaitingRoom({ roomCode, playerName, playerNumber, topic, players, error, goHome }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const player1 = players?.find(p => p.number === 1);
  const player2 = players?.find(p => p.number === 2);
  const bothJoined = players?.length === 2;

  return (
    <div className="waiting-page">
      <div className="waiting-container">
        <div className="logo" style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚔</span>
        </div>
        <h1 className="waiting-title">
          {bothJoined ? 'Battle Commencing…' : 'Waiting for Challenger'}
        </h1>
        <p className="waiting-subtitle">
          {bothJoined
            ? 'Both debaters are ready. Entering the arena…'
            : 'Share this code with your opponent'}
        </p>

        {error && <div className="error-banner animate-fade-in" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Room Code */}
        {!bothJoined && (
          <div className="room-code-display" onClick={copyCode} style={{ cursor: 'pointer' }} title="Click to copy">
            <div className="room-code-label">Room Code</div>
            <div className="room-code-value">{roomCode}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {copied ? '✓ Copied!' : 'Click to copy'}
            </div>
          </div>
        )}

        {/* Topic */}
        <div className="waiting-topic">
          <strong>Topic: </strong>"{topic}"
        </div>

        {/* Player Slots */}
        <div className="players-waiting">
          <div className={`player-slot ${player1 ? 'filled p1' : 'empty'}`}>
            <div className="player-slot-name">
              {player1 ? player1.name : '—'}
            </div>
            <div className="player-slot-label" style={{ color: player1 ? 'var(--p1)' : 'var(--text-faint)' }}>
              Player 1
            </div>
            {playerNumber === 1 && player1 && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--p1)', opacity: 0.7 }}>
                (you)
              </div>
            )}
          </div>

          <div className={`player-slot ${player2 ? 'filled p2' : 'empty'}`}>
            <div className="player-slot-name">
              {player2 ? player2.name : '?'}
            </div>
            <div className="player-slot-label" style={{ color: player2 ? 'var(--p2)' : 'var(--text-faint)' }}>
              Player 2
            </div>
            {playerNumber === 2 && player2 && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--p2)', opacity: 0.7 }}>
                (you)
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {!bothJoined && (
          <div className="waiting-spinner">
            <span className="spinner" />
            Waiting for opponent to join…
          </div>
        )}

        {bothJoined && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', color: 'var(--gold)', fontFamily: 'var(--font-display)',
            fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            marginTop: '1.5rem'
          }}>
            <span className="spinner" style={{ borderTopColor: 'var(--gold)' }} />
            Entering the arena…
          </div>
        )}

        <button
          className="btn btn-ghost"
          style={{ marginTop: '2rem' }}
          onClick={goHome}
        >
          ← Leave Room
        </button>
      </div>
    </div>
  );
}
