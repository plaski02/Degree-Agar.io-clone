import { server } from "./app.config";

const port = Number(process.env.PORT ?? 2567);

server.listen(port);
console.log(`MyRoom server ("my_room") in ascolto sulla porta ${port}`);
