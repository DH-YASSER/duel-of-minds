require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory room store
const rooms = {};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

function getRoomSafeData(room) {
  return {
    code: room.code,
    topic: room.topic,
    phase: room.phase,
    round: room.round,
    currentTurn: room.currentTurn,
    players: room.players,
    arguments: room.arguments
  };
}

// ─────────────────────────────────────────────
// AI Judge via Groq
// ─────────────────────────────────────────────

async function judgeDebate(room) {
  const { topic, players, arguments: args } = room;
  const p1 = players[0].name;
  const p2 = players[1].name;

  const transcript = args
    .map(a => `Round ${a.round} — ${a.playerName}: ${a.text}`)
    .join('\n\n');

  const prompt = `You are a sharp, authoritative debate judge. Judge the following debate between ${p1} and ${p2} on the topic: "${topic}".

TRANSCRIPT:
${transcript}

Evaluate each debater on Logic (reasoning quality), Evidence (use of facts/examples), and Rhetoric (persuasiveness, style). Be fair but decisive.

Return ONLY a valid JSON object — no markdown, no explanation, no preamble — with this exact shape:
{
  "winner": "${p1} or ${p2}",
  "scores": {
    "${p1}": { "logic": 0, "evidence": 0, "rhetoric": 0, "overall": 0 },
    "${p2}": { "logic": 0, "evidence": 0, "rhetoric": 0, "overall": 0 }
  },
  "verdict": "A dramatic 2-3 sentence verdict explaining who won and why.",
  "highlights": {
    "${p1}": "Their single most impressive argument or moment.",
    "${p2}": "Their single most impressive argument or moment."
  }
}
All scores are integers 0–100. The overall score should be a weighted average.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Extract JSON even if there's surrounding text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON in Groq response');

  return JSON.parse(jsonMatch[0]);
}

// ─────────────────────────────────────────────
// Socket.io Events
// ─────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── Create Room ──────────────────────────────
  socket.on('create-room', ({ playerName, topic }) => {
    if (!playerName?.trim() || !topic?.trim()) {
      return socket.emit('error', { message: 'Name and topic are required.' });
    }

    const code = generateCode();
    rooms[code] = {
      code,
      topic: topic.trim(),
      phase: 'waiting',   // waiting | debate | judging | results
      round: 1,
      currentTurn: null,
      players: [{ id: socket.id, name: playerName.trim(), number: 1 }],
      arguments: []
    };

    socket.join(code);
    socket.roomCode = code;

    socket.emit('room-created', { code, playerNumber: 1, topic: rooms[code].topic });
    console.log(`[Room ${code}] Created by "${playerName}" — Topic: "${topic}"`);
  });

  // ── Join Room ────────────────────────────────
  socket.on('join-room', ({ playerName, code }) => {
    if (!playerName?.trim() || !code?.trim()) {
      return socket.emit('error', { message: 'Name and room code are required.' });
    }

    const room = rooms[code];
    if (!room) return socket.emit('error', { message: 'Room not found. Check the code and try again.' });
    if (room.phase !== 'waiting') return socket.emit('error', { message: 'This room has already started.' });
    if (room.players.length >= 2) return socket.emit('error', { message: 'Room is full.' });
    if (room.players[0].name === playerName.trim()) {
      return socket.emit('error', { message: 'That name is taken in this room.' });
    }

    room.players.push({ id: socket.id, name: playerName.trim(), number: 2 });
    socket.join(code);
    socket.roomCode = code;

    // Transition to debate phase
    room.phase = 'debate';
    room.currentTurn = room.players[0].id; // Player 1 always opens

    io.to(code).emit('game-start', getRoomSafeData(room));
    console.log(`[Room ${code}] "${playerName}" joined. Debate starting!`);
  });

  // ── Submit Argument ──────────────────────────
  socket.on('submit-argument', ({ code, text }) => {
    const room = rooms[code];
    if (!room) return socket.emit('error', { message: 'Room not found.' });
    if (room.phase !== 'debate') return socket.emit('error', { message: 'Not in debate phase.' });
    if (room.currentTurn !== socket.id) return socket.emit('error', { message: "It's not your turn." });
    if (!text?.trim()) return socket.emit('error', { message: 'Argument cannot be empty.' });

    const player = room.players.find(p => p.id === socket.id);
    const argument = {
      playerId: socket.id,
      playerName: player.name,
      playerNumber: player.number,
      text: text.trim(),
      round: room.round,
      timestamp: Date.now()
    };

    room.arguments.push(argument);

    const argsThisRound = room.arguments.filter(a => a.round === room.round).length;
    const otherPlayer = room.players.find(p => p.id !== socket.id);

    console.log(`[Room ${code}] Round ${room.round} — "${player.name}" submitted. Args this round: ${argsThisRound}`);

    if (argsThisRound === 2) {
      if (room.round === 3) {
        // All 6 arguments submitted — start judging
        room.phase = 'judging';
        room.currentTurn = null;

        io.to(code).emit('argument-submitted', {
          argument,
          currentTurn: null,
          round: room.round,
          phase: 'judging'
        });

        io.to(code).emit('judging-started', { arguments: room.arguments });
        console.log(`[Room ${code}] All rounds complete. Judging...`);

        judgeDebate(room)
          .then(result => {
            room.phase = 'results';
            room.result = result;
            io.to(code).emit('game-over', {
              result,
              arguments: room.arguments,
              players: room.players,
              topic: room.topic
            });
            console.log(`[Room ${code}] Winner: ${result.winner}`);
          })
          .catch(err => {
            console.error(`[Room ${code}] Judge error:`, err.message);
            io.to(code).emit('judge-error', { message: 'The AI judge encountered an error. ' + err.message });
          });
        return;
      }

      // Advance to next round, Player 1 opens again
      room.round++;
      room.currentTurn = room.players[0].id;
    } else {
      // Other player's turn
      room.currentTurn = otherPlayer.id;
    }

    io.to(code).emit('argument-submitted', {
      argument,
      currentTurn: room.currentTurn,
      round: room.round,
      phase: room.phase
    });
  });

  // ── Disconnect ───────────────────────────────
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (code && rooms[code]) {
      console.log(`[-] "${socket.id}" disconnected from room ${code}`);
      io.to(code).emit('player-disconnected', {
        message: 'Your opponent has disconnected. The room has been closed.'
      });
      delete rooms[code];
    }
    console.log(`[-] Disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: Object.keys(rooms).length });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🎙️  Duel of Minds server running on http://localhost:${PORT}\n`);
});
