import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const bankStocks = pgTable("bank_stocks", {
  stockName: text("stock_name").primaryKey(),
  quantity: integer("quantity").notNull()
});

export const walletStocks = pgTable("wallet_stocks", {
  walletId: text("wallet_id").notNull(),
  stockName: text("stock_name").notNull(),
  quantity: integer("quantity").notNull()
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  walletId: text("wallet_id").notNull(),
  stockName: text("stock_name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});