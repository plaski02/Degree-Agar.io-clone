import { Room, Client, generateId } from "colyseus";
import { StateView } from "@colyseus/schema";
import { State } from "./State";
import { Entity, Player } from "./Entity";

// costanti utilizzate nel codice seguente
const MAPSIZE = 2000; // dimensioni del mondo di gioco
const MAXFOOD = 50; // quantità massima di cibo iniziale
const BASESPEED = 200; // velocità di partenza di ciascun giocatore

interface PlayerInput {
    x: number,
    y: number
}

export class GameRoom extends Room<State> {
    state = new State();
    patchRate = 33.3;

    nextFoodId = 0;
    targetPlayers = new Map<string, PlayerInput>();

    // onCreate invocato solo una volta, alla creazione della Room
    onCreate() {
        for (let i = 0; i < MAXFOOD; i++)
            this.spawnFood();

        // this.onMessage per intercettare i movimenti del mouse di un client
        this.onMessage("mouse", (client: Client, input: PlayerInput) => {
            const targetPlayer = this.state.entities.get(client.sessionId);
            if (!targetPlayer)
                return;
            this.targetPlayers.set(client.sessionId, input);
        });

        // Avvio del ciclo di simulazione in cui vengono attuate le modifiche
        this.setSimulationInterval((tickRate) => {
            this.update(tickRate);
        }, 16.6);
    }

    // onJoin invocato al join di un client
    onJoin(client: Client, options: any) {
        console.log("Client " + client.sessionId + " joined the Room");
        this.spawnPlayer(client);
    }

    // onLeave invocato quando un client di disconnette
    onLeave(client: Client) {
        console.log("Client " + client.sessionId + " leaved the Room");
        this.state.entities.delete(client.sessionId);
    }

    // Funzione ausiliaria per lo spawn di cibo
    private spawnFood() {
        const food = new Entity();
        food.x = Math.random() * MAPSIZE;
        food.y = Math.random() * MAPSIZE;
        food.radius = Math.max(4, Math.random() * 9); // il raggio del cibo varia fra una dimensione di 4 e 9, ma sempre più piccolo del raggio di partenza dei giocatori
        this.state.entities.set(`food_${this.nextFoodId++}`, food);
    }

    // Funzione ausiliaria per lo spawn di un giocatore
    private spawnPlayer(client: Client) {
        const player = new Player();
        player.x = Math.random() * MAPSIZE;
        player.y = Math.random() * MAPSIZE;
        this.state.entities.set(client.sessionId, player);
    }

    // Funzione ausiliaria in cui vengono effettuati i movimenti e il rilevamento delle collisioni
    private update(tickRate) {
        const deltaTime = tickRate / 1000;

        this.state.entities.forEach((entity, sessionId) => {
            const targetPlayer = this.targetPlayers.get(sessionId);
            if (!targetPlayer)
                return;

            const deltaX = targetPlayer.x - entity.x;
            const deltaY = targetPlayer.y - entity.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > 1) {
                const speed = BASESPEED / (entity.radius / 10);
                const step = Math.min(speed * deltaTime, distance);
                entity.speed = speed;

                entity.x += (deltaX / distance) * step;
                entity.y += (deltaY / distance) * step;
            }

            if (entity.x < 0)
                entity.x = 0;
            if (entity.x > MAPSIZE)
                entity.x = MAPSIZE;
            if (entity.y < 0)
                entity.y = 0;
            if (entity.y > MAPSIZE)
                entity.y = MAPSIZE;

            this.checkCollision(entity);
        });
    }

    // Funzione per il rilevamento delle collisioni
    private checkCollision(entity: Entity) {
        this.state.entities.forEach((collideEntity, collideSessionId) => {
            if (entity == collideEntity)
                return;

            const dx = entity.x - collideEntity.x;
            const dy = entity.y - collideEntity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < entity.radius && entity.radius > collideEntity.radius * 1.1) {
                entity.radius += collideEntity.radius / 5;
                this.state.entities.delete(collideSessionId);
                this.targetPlayers.delete(collideSessionId);

                if (collideEntity.radius < 10)
                    this.spawnFood();
            }            
        });
    }
}