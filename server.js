import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 3000
const players = {}

app.use(express.static(__dirname))

io.on('connection', (socket) => {
    console.log('Nuovo giocatore connesso:', socket.id);

    players[socket.id] = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    };

    socket.emit('initialize', {
        id: socket.id,
        players: players,
    });

    socket.broadcast.emit('newPlayer', {
        id: socket.id,
        position: players[socket.id].position,
        rotation: players[socket.id].rotation,
    });

    socket.on('update', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position;
            players[socket.id].rotation = data.rotation;

            socket.broadcast.emit('update', {
                id: socket.id,
                position: data.position,
                rotation: data.rotation,
            });
        }
    });

    socket.on('shoot', (data) => {
        socket.broadcast.emit('shoot', {
            id: socket.id,
            ...data,
        });
    });

    socket.on('disconnect', () => {
        console.log('Giocatore disconnesso:', socket.id);
        delete players[socket.id];
        io.emit('removePlayer', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
