import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { WalletTradeSchema, WalletSchema } from "../schemas";
import { buy, sell, getWallet, getWalletStock } from "./wallet.service";

const WalletParams = Type.Object({ wallet_id: Type.String() });
const StockParams = Type.Object({ wallet_id: Type.String(), stock_name: Type.String() });

export const walletRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post(
    "/wallets/:wallet_id/stocks/:stock_name",
    { schema: { params: StockParams, body: WalletTradeSchema } },
    async (req, reply) => {
      const { stock_name, wallet_id } = req.params;
      const { type } = req.body;

      try {
        if (type === "buy") await buy(wallet_id, stock_name);
        else await sell(wallet_id, stock_name);
        return reply.code(200).send();
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.code(404).send();
        return reply.code(400).send();
      }
    },
  );

  app.get(
    "/wallets/:wallet_id",
    { schema: { params: WalletParams, response: { 200: WalletSchema } } },
    async (req) => {
      return getWallet(req.params.wallet_id);
    },
  );

  app.get(
    "/wallets/:wallet_id/stocks/:stock_name",
    { schema: { params: StockParams, response: { 200: Type.Integer() } } },
    async (req, reply) => {
      const { wallet_id, stock_name } = req.params;
      return reply.send(await getWalletStock(wallet_id, stock_name));
    },
  );
};