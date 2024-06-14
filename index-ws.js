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

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.clients.forEach(client => client.terminate());
  server.close(() => {
    shutdownDB();
  });
});

// Websocket server below

const WebSocket = require('ws').Server;

const wss = new WebSocket({ server });

wss.on('connection', ws => {
  const numCLients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numCLients}`);

  wss.broadcast(`Current clients: ${numCLients}`);

  ws.readyState === ws.OPEN && ws.send('Welcome to the chat room!');

  db.run(`INSERT INTO visitors (count, time) VALUES (${numCLients}, dateTime('now'))`);

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

// Database code below

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE visitors (count INTEGER, time TEXT)');
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log('Shutting down database...')
  db.close();
}