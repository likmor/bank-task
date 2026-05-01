import { FastifyInstance } from "fastify";
import {
  buy,
  sell,
  getWallet,
  getWalletStock,
} from "./wallet.service";

export default async function (app: FastifyInstance) {
  app.post("/wallets/:wallet_id/stocks/:stock_name", async (req, reply) => {
    const { wallet_id, stock_name } = req.params as any;
    const { type } = req.body as any;

    try {
      if (type === "buy") await buy(wallet_id, stock_name);
      else if (type === "sell") await sell(wallet_id, stock_name);
      else return reply.code(400).send();

      return reply.code(200).send();
    } catch (e: any) {
      if (e.message === "NOT_FOUND") return reply.code(404).send();
      return reply.code(400).send();
    }
  });

  app.get("/wallets/:wallet_id", async (req) => {
    const { wallet_id } = req.params as any;
    return getWallet(wallet_id);
  });

  app.get(
    "/wallets/:wallet_id/stocks/:stock_name",
    async (req, reply) => {
      const { wallet_id, stock_name } = req.params as any;
      const qty = await getWalletStock(wallet_id, stock_name);
      return reply.send(qty);
    }
  );
}