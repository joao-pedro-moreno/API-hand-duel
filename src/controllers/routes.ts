import { FastifyInstance } from "fastify";
import { authenticate, profile, register } from "./user-controllers";
import { verifyJWT } from "@/middlewares/verify-jwt";

export async function routes(app: FastifyInstance) {
  app.post("/user/register", register)
  app.post("/user/authenticate", authenticate)

  app.get("/user/profile", { onRequest: [verifyJWT] }, profile)
}