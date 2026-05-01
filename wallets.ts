import { FastifyInstance } from 'fastify';
import { pool } from '../db/index.js';

export async function walletRoutes(app: FastifyInstance) {

  // GET /wallets/:wallet_id
  app.get<{ Params: { wallet_id: string } }>(
    '/wallets/:wallet_id',
    async (req, reply) => {
      const { wallet_id } = req.params;

      const result = await pool.query(
        `SELECT stock_name AS name, quantity
         FROM wallet_stocks
         WHERE wallet_id = $1 AND quantity > 0`,
        [wallet_id]
      );

      return reply.send({ id: wallet_id, stocks: result.rows });
    }
  );

  // GET /wallets/:wallet_id/stocks/:stock_name
  app.get<{ Params: { wallet_id: string; stock_name: string } }>(
    '/wallets/:wallet_id/stocks/:stock_name',
    async (req, reply) => {
      const { wallet_id, stock_name } = req.params;

      const bankCheck = await pool.query(
        `SELECT 1 FROM bank_stocks WHERE stock_name = $1`,
        [stock_name]
      );
      if (bankCheck.rowCount === 0) {
        return reply.status(404).send({ error: 'Stock not found' });
      }

      const result = await pool.query(
        `SELECT quantity FROM wallet_stocks
         WHERE wallet_id = $1 AND stock_name = $2`,
        [wallet_id, stock_name]
      );

      const quantity = result.rows[0]?.quantity ?? 0;
      return reply.send(quantity);
    }
  );

  // POST /wallets/:wallet_id/stocks/:stock_name
  app.post<{
    Params: { wallet_id: string; stock_name: string };
    Body: { type: 'buy' | 'sell' };
  }>(
    '/wallets/:wallet_id/stocks/:stock_name',
    async (req, reply) => {
      const { wallet_id, stock_name } = req.params;
      const { type } = req.body;

      if (type !== 'buy' && type !== 'sell') {
        return reply.status(400).send({ error: 'type must be "buy" or "sell"' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check stock exists in bank at all
        const bankCheck = await client.query(
          `SELECT quantity FROM bank_stocks WHERE stock_name = $1 FOR UPDATE`,
          [stock_name]
        );
        if (bankCheck.rowCount === 0) {
          await client.query('ROLLBACK');
          return reply.status(404).send({ error: 'Stock not found' });
        }

        if (type === 'buy') {
          // Atomically decrement bank — fails if quantity = 0
          const bankUpdate = await client.query(
            `UPDATE bank_stocks
             SET quantity = quantity - 1
             WHERE stock_name = $1 AND quantity > 0
             RETURNING quantity`,
            [stock_name]
          );
          if (bankUpdate.rowCount === 0) {
            await client.query('ROLLBACK');
            return reply.status(400).send({ error: 'No stock available in bank' });
          }

          // Upsert wallet stock
          await client.query(
            `INSERT INTO wallet_stocks (wallet_id, stock_name, quantity)
             VALUES ($1, $2, 1)
             ON CONFLICT (wallet_id, stock_name)
             DO UPDATE SET quantity = wallet_stocks.quantity + 1`,
            [wallet_id, stock_name]
          );

        } else {
          // sell: check wallet has stock
          const walletCheck = await client.query(
            `SELECT quantity FROM wallet_stocks
             WHERE wallet_id = $1 AND stock_name = $2
             FOR UPDATE`,
            [wallet_id, stock_name]
          );
          if ((walletCheck.rows[0]?.quantity ?? 0) === 0) {
            await client.query('ROLLBACK');
            return reply.status(400).send({ error: 'No stock in wallet' });
          }

          await client.query(
            `UPDATE wallet_stocks
             SET quantity = quantity - 1
             WHERE wallet_id = $1 AND stock_name = $2`,
            [wallet_id, stock_name]
          );

          await client.query(
            `UPDATE bank_stocks
             SET quantity = quantity + 1
             WHERE stock_name = $1`,
            [stock_name]
          );
        }

        // Audit log
        await client.query(
          `INSERT INTO audit_log (type, wallet_id, stock_name)
           VALUES ($1, $2, $3)`,
          [type, wallet_id, stock_name]
        );

        await client.query('COMMIT');
        return reply.status(200).send();

      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  );
}
