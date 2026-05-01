import { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance) {
  app.post("/chaos", async (req, reply) => {
    reply.code(200).send("killing instance" );

    setTimeout(() => {
      process.exit(1);
    }, 50);
  });
}
