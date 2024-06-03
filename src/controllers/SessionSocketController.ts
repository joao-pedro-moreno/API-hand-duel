import { InvalidCodeFormatError } from "@/errors/InvalidCodeFormatError";
import { SessionValidator } from "@/validators/SessionValidator";
import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";

const sessions = {}

export async function SessionSocket(socket: WebSocket, request: FastifyRequest) {
  const requestQueryParams = await request.query

  if (!requestQueryParams.code) {
    socket.send(JSON.stringify({ type: "error", message: "Session code required!" }))
    socket.close()
  }

  socket.on("message", (message) => {
    socket.send("Hi from server")
  })
}