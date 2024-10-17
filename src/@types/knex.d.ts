import { Knex } from "knex";

declare module "knex/types/tables" {
    export interface Tables {
        meal: {
            id: string;
            name: string;
            description: string;
            created_at: string;
            ate_in: string;
            in_diet: boolean;
            user_id: string;
        },
        user: {
            id: string;
            name: string;
            created_at: string;
        },
    }
}
