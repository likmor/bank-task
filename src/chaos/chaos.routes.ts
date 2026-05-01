import { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance) {
  app.post("/chaos", async () => {
    process.exit(1);
  });
}