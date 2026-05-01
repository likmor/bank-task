import { db } from "../db/client";
import { bankStocks, walletStocks, wallets, auditLog } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function buy(walletId: string, stockName: string) {
  return db.transaction(async (tx) => {
    const stock = await tx
      .select()
      .from(bankStocks)
      .where(eq(bankStocks.name, stockName))
      .for("update");

    if (!stock.length) throw new Error("NOT_FOUND");
    if (stock[0].quantity === 0) throw new Error("NO_STOCK");

    await tx
      .update(bankStocks)
      .set({ quantity: sql`${bankStocks.quantity} - 1` })
      .where(eq(bankStocks.name, stockName));

    await tx.insert(wallets).values({ id: walletId }).onConflictDoNothing();

    await tx
      .insert(walletStocks)
      .values({ walletId, stockName, quantity: 1 })
      .onConflictDoUpdate({
        target: [walletStocks.walletId, walletStocks.stockName],
        set: {
          quantity: sql`${walletStocks.quantity} + 1`,
        },
      });

    await tx.insert(auditLog).values({
      type: "buy",
      walletId,
      stockName,
    });
  });
}

export async function sell(walletId: string, stockName: string) {
  return db.transaction(async (tx) => {
    const stock = await tx
      .select()
      .from(bankStocks)
      .where(eq(bankStocks.name, stockName))
      .for("update");

    if (!stock.length) throw new Error("NOT_FOUND");

    const walletStock = await tx
      .select()
      .from(walletStocks)
      .where(
        and(
          eq(walletStocks.walletId, walletId),
          eq(walletStocks.stockName, stockName)
        )
      )
      .for("update");

    if (!walletStock.length || walletStock[0].quantity === 0) {
      throw new Error("NO_WALLET_STOCK");
    }

    await tx
      .update(walletStocks)
      .set({ quantity: sql`${walletStocks.quantity} - 1` })
      .where(
        and(
          eq(walletStocks.walletId, walletId),
          eq(walletStocks.stockName, stockName)
        )
      );

    await tx
      .update(bankStocks)
      .set({ quantity: sql`${bankStocks.quantity} + 1` })
      .where(eq(bankStocks.name, stockName));

    await tx.insert(auditLog).values({
      type: "sell",
      walletId,
      stockName,
    });
  });
}

export async function getWallet(walletId: string) {
  const rows = await db
    .select()
    .from(walletStocks)
    .where(eq(walletStocks.walletId, walletId));

  return {
    id: walletId,
    stocks: rows.map((r) => ({
      name: r.stockName,
      quantity: r.quantity,
    })),
  };
}

export async function getWalletStock(walletId: string, stockName: string) {
  const row = await db
    .select()
    .from(walletStocks)
    .where(
      and(
        eq(walletStocks.walletId, walletId),
        eq(walletStocks.stockName, stockName)
      )
    );

  return row.length ? row[0].quantity : 0;
}