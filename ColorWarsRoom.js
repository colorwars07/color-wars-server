const colyseus = require("colyseus");
const { ColorWarsState } = require("./ColorWarsState");

exports.ColorWarsRoom = class extends colyseus.Room {
    
    // 1. Cuando se crea la sala
    onCreate(options) {
        this.maxClients = 2; // Estricto: Solo 1vs1
        this.setState(new ColorWarsState()); // Le metemos tu matemática

        // 2. Escuchar los botonazos de los celulares
        this.onMessage("move", (client, message) => {
            const playerColor = client.userData.color;

            // El Árbitro revisa si el movimiento es legal y lo procesa
            const isValid = this.state.processMove(message.row, message.col, playerColor);

            if (isValid) {
                // Si alguien ganó después de la explosión
                if (this.state.winner !== "") {
                    console.log("¡Partida terminada! Ganador:", this.state.winner);
                    
                    // Le avisamos a los celulares que ya hay un ganador
                    this.broadcast("game_over", { winner: this.state.winner });

                    // Cerramos la sala para no gastar Memoria RAM
                    setTimeout(() => this.disconnect(), 1500);
                }
            } else {
                // Si el movimiento es ilegal (hackers), lo ignoramos
                client.send("error", "Movimiento no permitido o no es tu turno");
            }
        });
    }

    // 3. Cuando un jugador entra a la arena (CIRUGÍA: Toma el color del celular)
    onJoin(client, options) {
        // El servidor obedece el color exacto que le manda el celular
        client.userData = { color: options.color };
        console.log("Jugador unido como:", client.userData.color);
        
        if (this.clients.length >= 2) {
            this.lock(); // Cierra la puerta, nadie más entra
        }
    }

    // 4. Si alguien huye o se le cae el internet
    onLeave(client, consented) {
        console.log("Jugador abandonó:", client.userData.color);
        if (this.state.isActive) {
            // El que se queda, gana por abandono
            const winner = client.userData.color === "pink" ? "blue" : "pink";
            this.state.winner = winner;
            this.state.isActive = false;
            this.broadcast("game_over", { winner: winner, reason: "El rival huyó" });
            setTimeout(() => this.disconnect(), 1500);
        }
    }
}
