import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const bankStocks = pgTable("bank_stocks", {
  name: text("name").primaryKey(),
  quantity: integer("quantity").notNull()
});

export const wallets = pgTable("wallets", {
  id: text("id").primaryKey()
});

export const walletStocks = pgTable("wallet_stocks", {
  walletId: text("wallet_id").notNull(),
  stockName: text("stock_name").notNull(),
  quantity: integer("quantity").notNull()
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  walletId: text("wallet_id"),
  stockName: text("stock_name"),
  createdAt: timestamp("created_at").defaultNow()
});