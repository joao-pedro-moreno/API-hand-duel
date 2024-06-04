import { SessionDao } from "@/daos/SessionDao";
import { UserDao } from "@/daos/UserDao";
import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";

interface SessionsObject {
  [key: string]: SessionInfos
}

interface SessionInfos {
  player1Id: string
  player2Id: string
  player1Socket?: WebSocket
  player2Socket?: WebSocket
  rounds: number
}

const activeSessions: SessionsObject = {}

const validChoices = [1, 2, 3]

export async function SessionSocket(socket: WebSocket, request: FastifyRequest) {
  socket.send(JSON.stringify({
    type: "connection",
    message: "Socket connection successful!"
  }))

  socket.on("message", async (message) => {
    const messageObj = JSON.parse(message.toString())

    const sessionCode = messageObj.code
    const userId = messageObj.userId

    if (!sessionCode || typeof sessionCode !== "string") {
      socket.send(JSON.stringify({
        type: "error",
        message: "Session code required!"
      }))

      socket.close()

      return;
    }

    if (!userId || typeof userId !== "string") {
      socket.send(JSON.stringify({
        type: "error",
        message: "User ID required!"
      }))

      socket.close()

      return;
    }

    const sessionDao = new SessionDao()

    const session = await sessionDao.findSessionByCode(sessionCode)

    if (!session) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Session not found!"
      }))

      socket.close()

      return;
    }

    const userDao = new UserDao()

    const user = await userDao.findUserById(userId)

    if (!user) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Unauthorized!"
      }))

      socket.close()

      return;
    }

    if (messageObj.type === "join") {
      if (session.player1Id !== userId && session.player2Id !== userId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Unauthorized to enter this session!"
        }))

        socket.close()

        return;
      }

      if (!activeSessions[sessionCode]) {
        activeSessions[sessionCode] = {
          player1Id: userId,
          player2Id: "",
          player1Socket: socket,
          player2Socket: undefined,
          rounds: session.rounds
        }
      }

      if (activeSessions[sessionCode].player1Id && activeSessions[sessionCode].player2Id) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Session full!"
        }))

        socket.close()

        return;
      }

      switch (userId) {
        case session.player1Id:
          activeSessions[sessionCode].player1Id = userId
          activeSessions[sessionCode].player1Socket = socket

          break;
        case session.player2Id:
          activeSessions[sessionCode].player2Id = userId
          activeSessions[sessionCode].player2Socket = socket

          break
        default:
          socket.send(JSON.stringify({
            type: "error",
            message: "Unauthorized to enter this session!"

          }))

          socket.close()

          break
      }

      socket.send(JSON.stringify({
        type: "success",
        message: "Session connection successful!"
      }))
    }

    if (messageObj.type === "choice") {
      const choice = messageObj.choice

      // Choices:
      // 1 -> Rock
      // 2 -> Paper
      // 3 -> Scissors

      if (!validChoices.includes(choice)) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Invalid choice!"
        }))

        socket.close()

        return;
      }
    }
  })
}