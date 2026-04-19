import React, { useEffect, useState } from 'react';
import '../styles/App.css';

const JUDGING_MESSAGES = [
  'Analyzing logical consistency…',
  'Weighing evidence presented…',
  'Evaluating rhetorical mastery…',
  'Deliberating the verdict…',
  'Consulting the ancient scrolls…',
  'The judge strokes their beard thoughtfully…',
  'Calculating final scores…',
  'Preparing the verdict…',
];

export default function JudgingScreen({ players, topic, arguments: args, error }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [barWidths, setBarWidths] = useState([0, 0, 0]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % JUDGING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Animate bars to random "thinking" values
  useEffect(() => {
    const animate = () => {
      setBarWidths([
        30 + Math.random() * 60,
        30 + Math.random() * 60,
        30 + Math.random() * 60,
      ]);
    };
    animate();
    const interval = setInterval(animate, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="judging-page">
      <div className="judging-container animate-fade-up">
        <span className="judging-icon">⚖️</span>

        <h1 className="judging-title">The Judge Deliberates</h1>
        <p className="judging-subtitle">
          All arguments have been submitted. The AI is rendering its verdict.
        </p>

        {error && <div className="error-banner animate-fade-in">{error}</div>}

        {/* Players summary */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center',
          margin: '1.5rem 0', flexWrap: 'wrap'
        }}>
          {players?.map(p => (
            <div key={p.id} className={`player-badge ${p.number === 1 ? 'p1' : 'p2'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              {p.name}
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
          fontSize: '0.95rem'
        }}>
          "{topic}"
        </div>

        {/* Animated analysis bars */}
        <div className="judging-bars">
          {['Logic', 'Evidence', 'Rhetoric'].map((label, i) => (
            <div className="judging-bar-row" key={label}>
              <span className="judging-bar-label">{label}</span>
              <div className="judging-bar-track">
                <div
                  className="judging-bar-fill"
                  style={{
                    width: `${barWidths[i]}%`,
                    transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="judging-status animate-fade-in" key={msgIndex}>
          {JUDGING_MESSAGES[msgIndex]}
        </div>

        {/* Arguments count */}
        <p style={{
          marginTop: '2rem', fontSize: '0.8rem',
          color: 'var(--text-faint)', letterSpacing: '0.1em',
          fontFamily: 'var(--font-display)', textTransform: 'uppercase'
        }}>
          {args?.length || 6} arguments under review · 3 rounds complete
        </p>
      </div>
    </div>
  );
}
