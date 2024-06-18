import React, { useState } from 'react';
import '../styles/App.css';

function ScoreBar({ score, delay, playerClass }) {
  return (
    <div className="score-bar-track">
      <div
        className="score-bar-fill"
        style={{
          '--score-width': `${score}%`,
          '--delay': `${delay}s`
        }}
      />
    </div>
  );
}

function ScoreCard({ player, scores, playerClass }) {
  const s = scores?.[player.name];
  if (!s) return null;

  const bars = [
    { label: 'Logic',    value: s.logic    },
    { label: 'Evidence', value: s.evidence },
    { label: 'Rhetoric', value: s.rhetoric },
  ];

  return (
    <div className={`score-card ${playerClass}`}>
      <div className="score-card-header">
        <div>
          <div className="score-player-name">{player.name}</div>
          <div className={`player-badge ${playerClass}`} style={{ marginTop: '0.25rem' }}>
            Player {player.number}
          </div>
        </div>
        <div className="score-overall">{s.overall}</div>
      </div>

      <div className="score-bars">
        {bars.map((bar, i) => (
          <div key={bar.label} className="score-bar-row">
            <div className="score-bar-meta">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <ScoreBar score={bar.value} delay={0.2 + i * 0.15} playerClass={playerClass} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Results({ result, arguments: args, players, topic, goHome }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!result) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No results available.</p>
        <button className="btn btn-outline" onClick={goHome} style={{ marginTop: '1rem' }}>
          Return Home
        </button>
      </div>
    );
  }

  const winner = result.winner;
  const winnerPlayer = players?.find(p => p.name === winner);
  const winnerClass = winnerPlayer?.number === 1 ? 'p1' : 'p2';

  const p1 = players?.find(p => p.number === 1);
  const p2 = players?.find(p => p.number === 2);

  return (
    <div className="results-page">
      <div className="results-container">

        {/* Winner Banner */}
        <div className="winner-banner animate-fade-up">
          <span className="winner-crown">👑</span>
          <div className="winner-label">Victory goes to</div>
          <div className="winner-name">{winner}</div>
          {result.verdict && (
            <p className="verdict-text">"{result.verdict}"</p>
          )}
        </div>

        {/* Score Cards */}
        <div className="scores-grid" style={{ animationDelay: '0.1s' }}>
          {p1 && (
            <ScoreCard
              player={p1}
              scores={result.scores}
              playerClass="p1"
            />
          )}
          {p2 && (
            <ScoreCard
              player={p2}
              scores={result.scores}
              playerClass="p2"
            />
          )}
        </div>

        {/* Highlights */}
        {result.highlights && (
          <div className="highlights-section animate-fade-up">
            <div className="highlights-title">✦ Best Moments</div>
            {players?.map(player => {
              const highlight = result.highlights?.[player.name];
              if (!highlight) return null;
              const pClass = player.number === 1 ? 'p1' : 'p2';
              return (
                <div key={player.id} className={`highlight-item ${pClass}`}>
                  <div>
                    <div className="highlight-player">{player.name}</div>
                    <div className="highlight-text">"{highlight}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Transcript Toggle */}
        <div className="transcript-section animate-fade-up">
          <div
            className="transcript-title"
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setShowTranscript(v => !v)}
          >
            <span>📜 Full Transcript</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 0 }}>
              {showTranscript ? '▲ Hide' : '▼ Show'}
            </span>
          </div>

          {showTranscript && (
            <div className="transcript-list animate-fade-in">
              {args?.map((arg, i) => {
                const pClass = arg.playerNumber === 1 ? 'p1' : 'p2';
                return (
                  <div key={i} className={`transcript-item ${pClass}`}>
                    <div className="transcript-item-header">
                      <span className="transcript-player">{arg.playerName}</span>
                      <span className="transcript-round">Round {arg.round}</span>
                    </div>
                    <div>{arg.text}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="results-footer">
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1rem' }}>
            Topic: "{topic}"
          </p>
          <button className="btn btn-primary" onClick={goHome}>
            ⚔ New Duel
          </button>
          <button className="btn btn-ghost" onClick={goHome}>
            Return to Home
          </button>
        </div>

      </div>
    </div>
  );
}
