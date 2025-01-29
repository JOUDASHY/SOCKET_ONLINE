// serverOnlineUsers.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// Créer un serveur express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware pour traiter les requêtes POST (cURL)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let onlineUsers = new Map(); // Suivre les utilisateurs en ligne et leurs connexions WebSocket

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Écouter un message initial avec userId lors de la connexion
    ws.on('message', (message) => {
        const { userId } = JSON.parse(message);
        if (userId) {
            onlineUsers.set(userId, ws);
            broadcastOnlineUsers();
            console.log(userId,'Client connected');
        }
    });

    ws.on('close', () => {
        // Supprimer le client déconnecté
        const userId = [...onlineUsers.entries()].find(([, client]) => client === ws)?.[0];
        if (userId) {
            onlineUsers.delete(userId);
            broadcastOnlineUsers();
        }
        console.log('Client disconnected');
    });
});

// Fonction pour diffuser la liste des utilisateurs en ligne à tous les clients
function broadcastOnlineUsers() {
    const userIds = Array.from(onlineUsers.keys());
    const message = JSON.stringify({ type: 'onlineUsers', users: userIds });

    onlineUsers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Démarrer le serveur sur le port 3002
server.listen(3002, () => {
    console.log('WebSocket server for online users started on http://localhost:3002');
});
