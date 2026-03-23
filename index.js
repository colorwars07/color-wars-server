const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const { ColorWarsRoom } = require("./ColorWarsRoom"); // ¡Cable conectado!

const port = process.env.PORT || 2567;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Árbitro de Color Wars encendido y esperando jugadores ⚔️");
});

const server = createServer(app);
const gameServer = new Server({
    transport: new WebSocketTransport({ server: server })
});

// Registramos la sala en el motor
gameServer.define("arena", ColorWarsRoom);

gameServer.listen(port).then(() => {
    console.log(`🚀 Servidor de Color Wars corriendo en el puerto ${port}`);
});
