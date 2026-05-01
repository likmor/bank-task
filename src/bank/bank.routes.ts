import { db } from "../db/client";
import { bankStocks } from "../db/schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { SetStocksSchema } from "../schemas";

export const bankRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/stocks",
    { schema: { response: { 200: SetStocksSchema } } },
    async () => {
      const stocks = await db.select().from(bankStocks);
      return {
        stocks: stocks.map((s) => ({
          name: s.stockName,
          quantity: s.quantity,
        })),
      };
    },
  );

  app.post(
    "/stocks",
    { schema: { body: SetStocksSchema } },
    async (req, reply) => {
      const { stocks } = req.body;

      await db.transaction(async (tx) => {
        await tx.delete(bankStocks);
        if (stocks.length > 0) {
          await tx
            .insert(bankStocks)
            .values(
              stocks.map((s) => ({ stockName: s.name, quantity: s.quantity })),
            );
        }
      });

      return reply.code(200).send();
    },
  );
};
