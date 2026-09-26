import { uWebSocketsTransport } from "@colyseus/uwebsockets-transport";
import { defineServer, defineRoom } from "colyseus";
import { GameRoom } from "./rooms/GameRoom";

// Definizio del server e definizione della stanza "agarRoom"
export const server = defineServer({
    rooms: {
        agarRoom: defineRoom(GameRoom),
    },
    transport: new uWebSocketsTransport({}, {}),
});
