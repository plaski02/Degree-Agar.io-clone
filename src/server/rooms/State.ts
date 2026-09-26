import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity, Player } from "./Entity"

export class State extends Schema {
    // Map contenente tutte le entità all'interno del sistema (cibo o giocatori)
    @type({ map: Entity }) entities = new MapSchema<Entity>();
}