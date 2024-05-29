import { FastifyInstance } from "fastify";
import { authenticate, profile, registerUser } from "./user-controllers";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createSession, getSessionByOwnerUsername, joinSession, listActiveSessions } from "./sessions-controllers";

export async function routes(app: FastifyInstance) {

  app.post("/user/register", registerUser)
  app.post("/user/authenticate", authenticate)
  app.get("/user/profile", { onRequest: [verifyJWT] }, profile)

  app.post("/sessions/create", { onRequest: [verifyJWT] }, createSession)
  app.post("/sessions/:code/join", { onRequest: [verifyJWT] }, joinSession)
  app.get("/sessions/list/active", listActiveSessions)
  app.post("/sessions/searchByUsername", getSessionByOwnerUsername)
}