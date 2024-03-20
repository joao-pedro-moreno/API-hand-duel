import { FastifyInstance } from "fastify";
import { register } from "./user-controllers";

export async function routes(app: FastifyInstance) {
  app.post("/user/register", register)
}