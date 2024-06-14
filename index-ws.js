const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})

server.on('request', app);
server.listen(3000, () => {
  console.log('Server listening on port 3000')
});

// Websocket server

const WebSocket = require('ws').Server;

const wss = new WebSocket({ server });

wss.on('connection', ws => {
  const numCLients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numCLients}`);

  wss.broadcast(`Current clients: ${numCLients}`);

  ws.readyState === ws.OPEN && ws.send('Welcome to the chat room!');

  ws.on('close', () => {
    console.log('Client disconnected');
    wss.broadcast(`Current clients: ${wss.clients.size}`);
  });

  ws.on('message', message => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(client => {
    client.readyState === client.OPEN && client.send(data);
  });
}