const express = require("express");
const { createServer } = require("node:http");
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

const users = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    // When a user joins, they provide their username
    socket.on('register', (username) => {
        users[username] = socket.id;
        socket.username = username;
        console.log(`User registered: ${username}`);
    });

    socket.on('private message', (data) => {
        const { to, message } = data;
        const recipientSocketId = users[to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private message', {
                from: socket.username,
                message: message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.username) {
            delete users[socket.username];
        }
    });
});

server.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
});
