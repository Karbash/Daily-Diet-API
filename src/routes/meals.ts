import { db } from "../database";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkUserIdExists } from "../middlewares/check-user-is-exists";

export async function mealsRoutes(app: FastifyInstance) {
    app.get(
        "/",
        { preHandler: [checkUserIdExists] },
        async (req) => {
            const { userId } = req.cookies;
            const meals = await db("meal")
                .where("user_id", userId)
                .select("*")
            return {
                meals,
            };
        },
    );

    app.get(
        "/:id",
        { preHandler: [checkUserIdExists] },
        async (req) => {
            const { userId } = req.cookies;

            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            });

            const { id } = getMealParamsSchema.parse(req.params);

            const user = await db("meal")
                .where("id", id)
                .andWhere("user_id", userId)
                .first();

            return {
                user,
            };
        },
    );


    app.post("/", async (req, res) => {

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            ate_in: z.string(),
            in_diet: z.boolean(),
        });

        const { name, description, ate_in, in_diet } = createMealBodySchema.parse(req.body);

        let userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).send();
        }

        await db("meal").insert({
            id: randomUUID(),
            name,
            description,
            ate_in,
            in_diet,
            user_id: userId
        });

        return res.status(201).send();
    });

    app.put("/update/:id",
        { preHandler: [checkUserIdExists] },
        async (req, res) => {

            const { userId } = req.cookies;

            if (!userId) {
                return res.status(401).send();
            }

            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            });

            const { id } = getMealParamsSchema.parse(req.params);

            const createMealBodySchema = z.object({
                name: z.string(),
                description: z.string(),
                ate_in: z.string(),
                in_diet: z.boolean(),
            });

            const { name, description, ate_in, in_diet } = createMealBodySchema.parse(req.body);

            await db("meal").update({
                name,
                description,
                ate_in,
                in_diet,
                user_id: userId
            })
                .where("id", id)
                .andWhere("user_id", userId)

            return res.status(201).send();
        }
    );

    app.delete("/:id",
        { preHandler: [checkUserIdExists] },
        async (req, res) => {

            const { userId } = req.cookies;

            if (!userId) {
                return res.status(401).send();
            }

            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            });

            const { id } = getMealParamsSchema.parse(req.params);

            await db("meal").delete()
                .where("id", id)
                .andWhere("user_id", userId)

            return res.status(204).send();
        }
    );

    app.get(
        "/metrics",
        {
            preHandler: [checkUserIdExists], // Middlewares
        },
        async (req) => {
            const { userId } = req.cookies;

            // Recuperar todas as refeições do usuário
            const meals = await db("meal")
                .where("user_id", userId)
                .select("in_diet");

            const totalMeals = meals.length;

            // Contar refeições dentro e fora da dieta
            const mealsInDiet = meals.filter(meal => meal.in_diet).length;
            const mealsOutDiet = totalMeals - mealsInDiet;

            // Calcular a melhor sequência de refeições dentro da dieta
            let bestSequence = 0;
            let currentSequence = 0;

            meals.forEach((meal) => {
                if (meal.in_diet) {
                    currentSequence++;
                    bestSequence = Math.max(bestSequence, currentSequence);
                } else {
                    currentSequence = 0;
                }
            });

            return {
                totalMeals,
                mealsInDiet,
                mealsOutDiet,
                bestSequence,
            };
        }
    );

}
