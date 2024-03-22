import { FastifyInstance } from "fastify";
import { authenticate, profile, register } from "./user-controllers";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createSession, joinSession, listActiveSessions } from "./sessions-controllers";

export async function routes(app: FastifyInstance) {
  app.post("/user/register", register)
  app.post("/user/authenticate", authenticate)
  app.get("/user/profile", { onRequest: [verifyJWT] }, profile)

  app.post("/sessions/create", { onRequest: [verifyJWT] }, createSession)
  app.post("/sessions/:code/join", { onRequest: [verifyJWT] }, joinSession)
  app.get("/sessions/list/active", listActiveSessions)
}