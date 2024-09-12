const io = require('socket.io-client');

const socket = io('http://localhost:8080/global', { 
  auth: { 
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNBZGRyZXNzIjoiMHg3Yjk0NjljZjRmOWNiODE5NGUyMzQwZjkwOTk5ZWI4MmEwMGQ1YzZkIiwiaWF0IjoxNzEzNTM3MzE5LCJleHAiOjE4MTQxNDIxMTl9.27qZnaFtx-RQSFEg4DodFr4m0NZU1PH6XocFWySN7Ro' 
  } 
});
  
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('noti-numb', (data) => {
  console.log('Received noti-numb event:', data);
});