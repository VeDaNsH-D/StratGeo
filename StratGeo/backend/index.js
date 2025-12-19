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
// Helper to create formations
const createBattalion = () => {
  const units = [];
  
  // 1. Blue Team (India - 1 Tank, 8 Soldiers)
  units.push({ id: 'b_tank1', position: [5, 0.5, 5], color: 'blue', type: 'tank' });
  for(let i=0; i<8; i++) {
    units.push({ 
      id: `b_soldier${i}`, 
      // Arrange in a wedge formation behind the tank
      position: [5 + (i%2===0?1:-1)*(i*0.5), 0.5, 7 + Math.floor(i/2)], 
      color: 'blue', 
      type: 'soldier' 
    });
  }

  // 2. Red Team (Enemy - 1 Tank, 7 Soldiers)
  units.push({ id: 'r_tank1', position: [-5, 0.5, -5], color: 'red', type: 'tank' });
  for(let i=0; i<7; i++) {
    units.push({ 
      id: `r_soldier${i}`, 
      position: [-5 + (i%2===0?1:-1)*(i*0.5), 0.5, -7 - Math.floor(i/2)], 
      color: 'red', 
      type: 'soldier' 
    });
  }
  
  return units;
};

let units = createBattalion();

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
