import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import '../styles/App.css';

const MAX_CHARS = 600;

export default function Debate({
  players, topic, round, currentTurn,
  arguments: args, playerNumber, playerName,
  submitArgument, error, goHome
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  const isMyTurn = currentTurn === socket.id;
  const myPlayer = players?.find(p => p.number === playerNumber);
  const opponent = players?.find(p => p.number !== playerNumber);

  // Auto-scroll to latest argument
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [args]);

  // Reset text when turn changes to us
  useEffect(() => {
    if (isMyTurn) {
      setText('');
      setSubmitting(false);
    }
  }, [isMyTurn]);

  const handleSubmit = () => {
    if (!text.trim() || submitting || !isMyTurn) return;
    setSubmitting(true);
    submitArgument(text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const roundLabel = (r) => {
    const labels = ['', 'Opening', 'Rebuttal', 'Closing'];
    return labels[r] || `Round ${r}`;
  };

  const argsThisRound = args.filter(a => a.round === round).length;
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="debate-page">
      {/* Header */}
      <header className="debate-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="player-badge p1">{players?.[0]?.name || 'Player 1'}</span>
        </div>

        <div className="debate-header-center">
          <div className="debate-topic-label">Debate Topic</div>
          <div className="debate-topic-text">"{topic}"</div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className="player-badge p2">{players?.[1]?.name || 'Player 2'}</span>
        </div>
      </header>

      {/* Round indicator */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="round-indicator">Round {round} — {roundLabel(round)}</div>
          <div className="round-pips">
            {[1, 2, 3].map(r => (
              <div
                key={r}
                className={`round-pip ${r < round ? 'done' : r === round ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="debate-body">
        {error && <div className="error-banner animate-fade-in">{error}</div>}

        {/* Arguments */}
        <div className="arguments-scroll" ref={scrollRef}>
          {args.length === 0 ? (
            <div className="empty-arguments">
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚔</p>
              The debate has begun. {isMyTurn ? 'You open the floor.' : `Waiting for ${opponent?.name} to open…`}
            </div>
          ) : (
            args.map((arg, i) => {
              const pClass = arg.playerNumber === 1 ? 'p1' : 'p2';
              return (
                <div key={i} className={`argument-bubble ${pClass}`}>
                  <div className="argument-avatar">
                    {arg.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="argument-content">
                    <div className="argument-meta">
                      <span>{arg.playerName}</span>
                      <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>R{arg.round}</span>
                    </div>
                    <div className="argument-text">{arg.text}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Turn Banner */}
        <div className={`turn-banner ${isMyTurn ? 'your-turn' : 'their-turn'}`}>
          {isMyTurn ? (
            <>
              <span className="turn-dot" />
              Your turn — {roundLabel(round)} argument
            </>
          ) : (
            <>
              <span className="turn-dot" style={{ animation: 'none', opacity: 0.4 }} />
              {opponent?.name || 'Opponent'} is composing their argument…
            </>
          )}
        </div>

        {/* Input Area */}
        <div className={`input-area ${isMyTurn ? 'active' : 'inactive'}`}>
          <div className="input-area-header">
            <span>Your Argument</span>
            <span className={`char-count ${isOverLimit ? 'warning' : ''}`}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>

          <div className="input-row">
            <textarea
              className="input"
              placeholder={
                isMyTurn
                  ? `Make your ${roundLabel(round).toLowerCase()} argument… (Ctrl+Enter to submit)`
                  : `Waiting for ${opponent?.name || 'opponent'}…`
              }
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isMyTurn || submitting}
              maxLength={MAX_CHARS + 50}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
              Ctrl+Enter to submit
            </span>
            <button
              className={`btn ${playerNumber === 1 ? 'btn-p1' : 'btn-p2'}`}
              onClick={handleSubmit}
              disabled={!isMyTurn || submitting || !text.trim() || isOverLimit}
            >
              {submitting ? (
                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</>
              ) : (
                `Submit Argument →`
              )}
            </button>
          </div>
        </div>

        {/* Round progress hint */}
        <div style={{
          textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-faint)',
          fontFamily: 'var(--font-display)', letterSpacing: '0.1em'
        }}>
          {argsThisRound}/2 arguments submitted this round
          {round < 3 ? ` · ${3 - round} round${3 - round > 1 ? 's' : ''} remain` : ' · Final round'}
        </div>
      </div>
    </div>
  );
}
