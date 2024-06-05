import { SessionDao } from "@/daos/SessionDao"
import { UserDao } from "@/daos/UserDao"
import { NotConnectedToSessionError } from "@/errors/NotConnectedToSessionError"
import { SessionIsFullError } from "@/errors/SessionIsFullError"
import { SessionNotFoundError } from "@/errors/SessionNotFoundError"
import { UnauthorizedSessionError } from "@/errors/UnauthorizedSessionError"
import { UserNotFoundError } from "@/errors/UserNotFoundError"
import { WebSocket } from "ws"

interface SessionsObject {
  [key: string]: SessionInfos
}

interface SessionInfos {
  player1Id: string | null
  player2Id: string | null
  player1Socket?: WebSocket
  player2Socket?: WebSocket
  rounds: number
  player1Choice?: 1 | 2 | 3
  player2Choice?: 1 | 2 | 3
}

type ValidChoices = 1 | 2 | 3

const activeSessions: SessionsObject = {}

const validChoices: ValidChoices[] = [1, 2, 3]

export class SessionSocketService {
  private sessionDao: SessionDao
  private userDao: UserDao

  constructor() {
    this.sessionDao = new SessionDao()
    this.userDao = new UserDao()
  }

  async handleJoinSession(socket: WebSocket, sessionCode: string, userId: string) {
    const session = await this.sessionDao.findSessionByCode(sessionCode)

    if (!session) {
      throw new SessionNotFoundError()
    }

    const user = await this.userDao.findUserById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (session.player1Id !== userId && session.player2Id !== userId) {
      throw new UnauthorizedSessionError()
    }

    if (!activeSessions[sessionCode]) {
      activeSessions[sessionCode] = {
        player1Id: session.player1Id,
        player2Id: session.player2Id,
        rounds: session.rounds
      }
    }

    const currentSession = activeSessions[sessionCode]

    if (currentSession.player1Socket && currentSession.player2Socket) {
      throw new SessionIsFullError()
    }

    if (session.player1Id === userId) {
      currentSession.player1Socket = socket
    } else if (session.player2Id === userId) {
      currentSession.player2Socket = socket
    } else {
      throw new UnauthorizedSessionError()
    }

    socket.send(JSON.stringify({
      type: "success",
      message: "Session connection successful!"
    }))
  }

  handlePlayerChoice(sessionCode: string, userid: string, choice: ValidChoices) {
    const currentSession = activeSessions[sessionCode]

    if (!currentSession) {
      throw new NotConnectedToSessionError()
    }

    // const isPlayer
  }
}