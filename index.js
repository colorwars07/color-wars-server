const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");

// En el próximo paso conectaremos el archivo de la Sala de Batalla
// const { ColorWarsRoom } = require("./ColorWarsRoom");

const port = process.env.PORT || 2567;
const app = express();

// Permite que tu página en Vercel se pueda conectar a este servidor
app.use(cors());
app.use(express.json());

// Ruta de diagnóstico (El "Despertador" visitará esta ruta para que no se apague)
app.get("/", (req, res) => {
    res.send("Árbitro de Color Wars encendido y esperando jugadores ⚔️");
});

// Creando el servidor de red
const server = createServer(app);
const gameServer = new Server({
    transport: new WebSocketTransport({
        server: server
    })
});

// Aquí registraremos la sala en el próximo paso
// gameServer.define("arena", ColorWarsRoom);

// Encender el motor
gameServer.listen(port).then(() => {
    console.log(`🚀 Servidor de Color Wars corriendo en el puerto ${port}`);
});
  
