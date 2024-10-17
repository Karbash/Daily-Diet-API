import { db } from "../database";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkUserIdExists } from "../middlewares/check-user-is-exists";

export async function usersRoutes(app: FastifyInstance) {


    app.get(
        "/",
        { preHandler: [checkUserIdExists] },
        async (req) => {
            const { userId } = req.cookies;
            const user = await db("user")
                .where("id", userId)
                .select("*")
                .first();
            return {
                user,
            };
        },
    );


    app.post("/", async (req, res) => {

        const createUserBodySchema = z.object({
            name: z.string()
        });

        const { name } = createUserBodySchema.parse(req.body);

        let userId = randomUUID();
        res.cookie("userId", userId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, //7 dias
        });

        await db("user").insert({
            id: userId,
            name
        });

        return res.status(201).send();
    });

}
