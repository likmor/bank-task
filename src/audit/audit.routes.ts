import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { auditLog } from "../db/schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { AuditLogResponseSchema } from "../schemas";

export const auditRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/log",
    { schema: { response: { 200: AuditLogResponseSchema } } },
    async () => {
      const log = await db.select().from(auditLog);

      return {
        log: log.map((l) => ({
          type: l.type,
          wallet_id: l.walletId,
          stock_name: l.stockName,
        })),
      };
    },
  );
};
