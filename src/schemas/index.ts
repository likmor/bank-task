import { Type, Static } from "@sinclair/typebox";

export const StockSchema = Type.Object({
  name: Type.String(),
  quantity: Type.Integer({minimum: 0}),
});

export const SetStocksSchema = Type.Object({
  stocks: Type.Array(StockSchema),
});

export const WalletTradeSchema = Type.Object({
  type: Type.Union([Type.Literal("buy"), Type.Literal("sell")]),
});

export const WalletSchema = Type.Object({
  id: Type.String(),
  stocks: Type.Array(StockSchema),
});

export const AuditLogSchema = Type.Object({
  type: Type.String(),
  wallet_id: Type.String(),
  stock_name: Type.String(),
});

export const AuditLogResponseSchema = Type.Object({
  log: Type.Array(AuditLogSchema),
});

export type StockDTO = Static<typeof StockSchema>;
export type SetStocksDTO = Static<typeof SetStocksSchema>;
export type WalletTradeDTO = Static<typeof WalletTradeSchema>;
export type WalletDTO = Static<typeof WalletSchema>;
export type AuditLogDTO = Static<typeof AuditLogSchema>;