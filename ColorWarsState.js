const { Schema, type, ArraySchema } = require("@colyseus/schema");

// 1. Definimos cómo es una Celda
class Cell extends Schema {
    constructor() {
        super();
        this.owner = ""; // Vacío al principio
        this.mass = 0;   // Arranca con 0 orbes
    }
}
type("string")(Cell.prototype, "owner");
type("number")(Cell.prototype, "mass");

// 2. Definimos una Fila (Para mantener tu diseño de 5x5)
class Row extends Schema {
    constructor() {
        super();
        this.cells = new ArraySchema();
    }
}
type([ Cell ])(Row.prototype, "cells");

// 3. Definimos el Tablero y las Reglas
class ColorWarsState extends Schema {
    constructor() {
        super();
        this.currentTurn = "pink";
        this.turnCount = 0;
        this.isActive = true;
        this.winner = "";

        // Creamos tu tablero exacto de 5x5
        this.board = new ArraySchema();
        for (let r = 0; r < 5; r++) {
            const row = new Row();
            for (let c = 0; c < 5; c++) {
                row.cells.push(new Cell());
            }
            this.board.push(row);
        }
    }

    // 🧠 AQUÍ ESTÁ TU REGLA EXACTA DE BLOQUEO
    processMove(row, col, color) {
        if (!this.isActive || this.currentTurn !== color) return false;

        let myPieces = 0;
        // Contamos cuántas fichas tienes en la arena
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.board[r].cells[c].owner === color) myPieces++;
            }
        }

        const targetCell = this.board[row].cells[col];

        // REGLA MAESTRA: Si ya pusiste tu primera ficha, las demás celdas quedan bloqueadas.
        // SOLO puedes tocar las tuyas para expandirte.
        if (myPieces > 0 && targetCell.owner !== color) {
            return false; // Movimiento Ilegal (Hackers rebotados)
        }
        
        // Si la celda es del rival, también está bloqueada
        if (targetCell.owner !== "" && targetCell.owner !== color) {
            return false;
        }

        // Si pasa la seguridad, sumamos masa
        this.addMass(row, col, color);
        this.turnCount++;
        this.currentTurn = (this.currentTurn === "pink") ? "blue" : "pink";
        this.checkGameOver();
        return true;
    }

    // La suma de masa
    addMass(row, col, color) {
        const cell = this.board[row].cells[col];
        cell.owner = color;
        cell.mass++;

        // REGLA DE EXPANSIÓN: Al llegar a 4, explota
        if (cell.mass >= 4) {
            this.explode(row, col, color);
        }
    }

    // La Reacción en Cadena (Recursividad)
    explode(row, col, color) {
        const cell = this.board[row].cells[col];
        cell.mass = 0;
        cell.owner = ""; // Queda libre al explotar

        const neighbors = [];
        if (row > 0) neighbors.push({r: row - 1, c: col});
        if (row < 4) neighbors.push({r: row + 1, c: col});
        if (col > 0) neighbors.push({r: row, c: col - 1});
        if (col < 4) neighbors.push({r: row, c: col + 1});

        // Contagia a los vecinos
        for (let n of neighbors) {
            this.addMass(n.r, n.c, color);
        }
    }

    // Condición de Victoria
    checkGameOver() {
        let p = 0, b = 0;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.board[r].cells[c].owner === "pink") p++;
                if (this.board[r].cells[c].owner === "blue") b++;
            }
        }
        if (this.turnCount >= 2) {
            if (p === 0) { this.winner = "blue"; this.isActive = false; }
            if (b === 0) { this.winner = "pink"; this.isActive = false; }
        }
    }
}

type("string")(ColorWarsState.prototype, "currentTurn");
type("number")(ColorWarsState.prototype, "turnCount");
type("boolean")(ColorWarsState.prototype, "isActive");
type("string")(ColorWarsState.prototype, "winner");
type([ Row ])(ColorWarsState.prototype, "board");

exports.ColorWarsState = ColorWarsState;
