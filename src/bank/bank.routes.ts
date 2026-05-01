import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { bankStocks } from "../db/schema";

export default async function (app: FastifyInstance) {
  app.get("/stocks", async () => {
    const stocks = await db.select().from(bankStocks);
    return {
      stocks: stocks.map((s) => ({
        name: s.name,
        quantity: s.quantity,
      })),
    };
  });

  app.post("/stocks", async (req, reply) => {
    const { stocks } = req.body as any;

    for (const s of stocks) {
      await db
        .insert(bankStocks)
        .values(s)
        .onConflictDoUpdate({
          target: bankStocks.name,
          set: { quantity: s.quantity },
        });
    }

    return reply.code(200).send();
  });
}