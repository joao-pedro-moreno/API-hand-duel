import { OtherPlayerDisconnectedError } from '@/errors/OtherPlayerDisconnectedError';
import { SessionSocketService } from './../services/SessionSocketService';
import { SessionCodeRequiredError } from '@/errors/SessionCodeRequiredError';
import { UnknowMessageTypeError } from '@/errors/UnknowMessageTypeError';
import { UserIdRequiredError } from '@/errors/UserIdRequiredError';
import { WebSocket } from "ws";
import { InvalidChoiceError } from '@/errors/InvalidChoiceError';

interface UserWebSocket extends WebSocket {
  sessionCode: string
  userId: string
}

export async function SessionSocket(socket: WebSocket) {
  const sessionSocketService = new SessionSocketService()

  socket.send(JSON.stringify({
    type: "connection",
    message: "Socket connection successful!"
  }))

  socket.on("message", async (message) => {
    try {
      const messageObj = JSON.parse(message.toString())

      const { code, userId, type, choice, result } = messageObj

      if (!code || typeof code !== "string") {
        throw new SessionCodeRequiredError()
      }

      if (!userId || typeof userId !== "string") {
        throw new UserIdRequiredError()
      }

      (socket as UserWebSocket).sessionCode = code;
      (socket as UserWebSocket).userId = userId;

      switch (type) {
        case "join":
          await sessionSocketService.handleJoinSession(socket, code, userId)
          break;
        case "choice":
          sessionSocketService.handlePlayerChoice(code, userId, choice)
          break;
        case "finish":
          sessionSocketService.finishSession(code, userId, result)
          break;
        default:
          throw new UnknowMessageTypeError()
      }
    } catch (error) {

      if (error instanceof OtherPlayerDisconnectedError || error instanceof InvalidChoiceError) {
        socket.send(JSON.stringify({
          type: "error",
          message: error.message
        }))
      }

      if (error instanceof Error) {
        socket.send(JSON.stringify({
          type: "error",
          message: error.message
        }))

        socket.close()
      }
    }
  })

  socket.on("close", async () => {
    try {
      const sessionCode = (socket as UserWebSocket).sessionCode
      const userId = (socket as UserWebSocket).userId

      if (sessionCode && userId) {
        sessionSocketService.handleRemovePlayerFromSession(sessionCode, userId)
      }
    } catch (error) {
      console.error("Error handling socket close: ", error)
    }
  })
}