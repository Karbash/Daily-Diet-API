import { env } from "./env";
import { app } from "./app";

app
    .listen({
        port: env.PORT || 4000,
        host: '0.0.0.0',
    })
    .then(() => {
        console.log("[ SERVER - 'Daily Diet' - Disponìvel ]");
    });
