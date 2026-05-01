import Fastify from "fastify";
import walletRoutes from "./wallet/wallet.routes";
import bankRoutes from "./bank/bank.routes";
import auditRoutes from "./audit/audit.routes";
import chaosRoutes from "./chaos/chaos.routes";
import health from "./health";

export function buildApp() {
  const app = Fastify();

  app.register(health);
  app.register(walletRoutes);
  app.register(bankRoutes);
  app.register(auditRoutes);
  app.register(chaosRoutes);

  return app;
}