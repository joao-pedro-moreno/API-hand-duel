import { FastifyInstance } from "fastify";
import { authenticateUser, deleteUser, getUserProfile, registerUser } from "./UserController";
import { verifyJWT } from "@/middlewares/VerifyJWT";
import { createSession, getSessionByOwnerUsername, joinSession, listActiveSessions } from "./SessionController";
import { SessionSocket } from "./SessionSocketController";

export async function routes(app: FastifyInstance) {
  app.post("/user/register", registerUser)
  app.post("/user/authenticate", authenticateUser)
  app.get("/user/profile", { onRequest: [verifyJWT] }, getUserProfile)
  app.delete("/user/delete", { onRequest: [verifyJWT] }, deleteUser)

  app.post("/sessions/create", { onRequest: [verifyJWT] }, createSession)
  app.post("/sessions/:code/join", { onRequest: [verifyJWT] }, joinSession)
  app.get("/sessions/list/active", listActiveSessions)
  app.post("/sessions/searchByUsername", getSessionByOwnerUsername)

  app.get("/sessions/connectSocket", { websocket: true }, SessionSocket)
}