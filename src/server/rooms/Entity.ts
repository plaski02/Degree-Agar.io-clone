import { Schema, type } from "@colyseus/schema"
import { entity } from "@colyseus/schema"

// Entità generica contenente le proprietà mutabili comuni
export class Entity extends Schema {
    @type("float32") x!: number;
    @type("float32") y!: number;
    @type("int16") radius!: number;

    // Proprietà non sincronizzata che rappresenta la velocità di un'entità (rimane a 0 per il cibo, varia per i giocatori)
    speed = 0;
}

// Schema che estende Entity e che rappresenta un giocatore, in cui viene impostato un valore del raggio di default
@entity
export class Player extends Entity {
    radius = 10;
}