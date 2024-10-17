import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("user", (table) => {
        table.uuid("id").primary();
        table.text("name").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });

    await knex.schema.createTable("meal", (table) => {
        table.uuid("id").primary();
        table.text("name").notNullable();
        table.text("description");
        table.boolean("in_diet").notNullable();
        table.timestamp("ate_in").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        table.uuid("user_id").notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("user");
    await knex.schema.dropTable("meal");
}

