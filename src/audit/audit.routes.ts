import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { auditLog } from "../db/schema";

export default async function (app: FastifyInstance) {
  app.get("/log", async () => {
    const log = await db.select().from(auditLog);

    return {
      log: log.map((l) => ({
        type: l.type,
        wallet_id: l.walletId,
        stock_name: l.stockName,
      })),
    };
  });
}