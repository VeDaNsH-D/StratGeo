const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from anywhere (for hackathon demo)
    methods: ["GET", "POST"]
  }
});

// Initial State of the Battlefield
let units = [
  { id: '1', position: [0, 0, 0], color: '#4facfe', type: 'tank' }, // Blue Tank
  { id: '2', position: [4, 0, 4], color: '#ff0844', type: 'enemy' } // Red Enemy
];

io.on('connection', (socket) => {
  console.log('Commander connected:', socket.id);

  // 1. Send current state to new user
  socket.emit('init', units);

  // 2. Listen for unit moves
  socket.on('moveUnit', (data) => {
    // Update server state
    units = units.map(u => u.id === data.id ? { ...u, position: data.position } : u);
    // Broadcast to everyone else
    io.emit('updateUnits', units);
  });

  socket.on('disconnect', () => {
    console.log('Commander disconnected');
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});
