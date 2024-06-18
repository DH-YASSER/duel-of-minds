import React, { useState, useEffect, useCallback } from 'react';
import socket from './socket';
import Home from './pages/Home';
import WaitingRoom from './pages/WaitingRoom';
import Debate from './pages/Debate';
import JudgingScreen from './pages/JudgingScreen';
import Results from './pages/Results';
import './styles/App.css';

const INITIAL_STATE = {
  page: 'home',           // home | waiting | debate | judging | results
  roomCode: null,
  playerName: '',
  playerNumber: null,     // 1 or 2
  players: [],
  topic: '',
  round: 1,
  currentTurn: null,      // socket id
  arguments: [],
  result: null,
  error: null
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);

  const set = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates, error: null }));
  }, []);

  const setError = useCallback((message) => {
    setState(prev => ({ ...prev, error: message }));
  }, []);

  // ── Socket lifecycle ──────────────────────────
  useEffect(() => {
    socket.connect();

    const handlers = {
      'connect': () => {
        console.log('Socket connected:', socket.id);
      },
      'disconnect': () => {
        console.log('Socket disconnected');
      },
      'connect_error': () => {
        setError('Cannot connect to server. Make sure the backend is running on port 3001.');
      },

      // Room events
      'room-created': ({ code, playerNumber, topic }) => {
        set({ page: 'waiting', roomCode: code, playerNumber, topic });
      },
      'game-start': ({ players, topic, currentTurn, round }) => {
        set({ page: 'debate', players, topic, currentTurn, round, arguments: [] });
      },
      'argument-submitted': ({ argument, currentTurn, round, phase }) => {
        setState(prev => ({
          ...prev,
          arguments: [...prev.arguments, argument],
          currentTurn,
          round,
          page: phase === 'judging' ? 'judging' : 'debate',
          error: null
        }));
      },
      'judging-started': ({ arguments: args }) => {
        setState(prev => ({
          ...prev,
          page: 'judging',
          arguments: args,
          error: null
        }));
      },
      'game-over': ({ result, arguments: args, players, topic }) => {
        set({ page: 'results', result, arguments: args, players, topic });
      },
      'judge-error': ({ message }) => {
        setError('AI Judge Error: ' + message);
        setState(prev => ({ ...prev, page: 'judging' }));
      },
      'player-disconnected': ({ message }) => {
        setState({ ...INITIAL_STATE, error: message });
      },
      'error': ({ message }) => {
        setError(message);
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────
  const createRoom = useCallback((playerName, topic) => {
    setState(prev => ({ ...prev, playerName, error: null }));
    socket.emit('create-room', { playerName, topic });
  }, []);

  const joinRoom = useCallback((playerName, code) => {
    setState(prev => ({ ...prev, playerName, error: null }));
    socket.emit('join-room', { playerName, code });
  }, []);

  const submitArgument = useCallback((text) => {
    socket.emit('submit-argument', { code: state.roomCode, text });
  }, [state.roomCode]);

  const goHome = useCallback(() => {
    setState(INITIAL_STATE);
    socket.disconnect();
    setTimeout(() => socket.connect(), 100);
  }, []);

  // ── Render ────────────────────────────────────
  const props = { ...state, createRoom, joinRoom, submitArgument, goHome, setError };

  return (
    <>
      {state.page === 'home'    && <Home    {...props} />}
      {state.page === 'waiting' && <WaitingRoom {...props} />}
      {state.page === 'debate'  && <Debate  {...props} />}
      {state.page === 'judging' && <JudgingScreen {...props} />}
      {state.page === 'results' && <Results {...props} />}
    </>
  );
}
