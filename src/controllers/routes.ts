import { FastifyInstance } from "fastify";
import { authenticate, register } from "./user-controllers";

export async function routes(app: FastifyInstance) {
  app.post("/user/register", register)
  app.post("/user/authenticate", authenticate)
}