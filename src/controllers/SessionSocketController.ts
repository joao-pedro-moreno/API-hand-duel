import { SessionDao } from "@/daos/SessionDao";
import { SessionValidator } from "@/validators/SessionValidator";
import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";

interface SessionsObject {
  [key: string]: WebSocket[]
}

const sessions: SessionsObject = {}

export async function SessionSocket(socket: WebSocket, request: FastifyRequest) {
  const code = new SessionValidator().validateSocketCode(request)

  if (!code) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Session code required!"
    }))

    socket.close()

    return;
  }

  const sessionDao = new SessionDao()

  const session = sessionDao.findSessionByCode(code)

  if (!session) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Session not found!"
    }))

    socket.close()

    return;
  }

  if (!sessions[code]) {
    sessions[code] = []
  }

  if (sessions[code].length >= 2) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Session is full"
    }))

    socket.close()

    return;
  }

  sessions[code].push(socket)

  socket.on("message", (message) => {
    socket.send(sessions[code].length)
  })
}