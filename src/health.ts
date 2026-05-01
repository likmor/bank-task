export default async function (app: any) {
  app.get("/health", async () => ({ ok: true }));
}