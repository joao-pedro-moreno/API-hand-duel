import { SessionDao } from "@/daos/SessionDao"
import { UserDao } from "@/daos/UserDao"
import { InvalidChoiceError } from "@/errors/InvalidChoiceError"
import { NotConnectedToSessionError } from "@/errors/NotConnectedToSessionError"
import { OtherPlayerDisconnectedError } from "@/errors/OtherPlayerDisconnectedError"
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

type ResultOptions = "player1" | "player2" | "tie"

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

  handlePlayerChoice(sessionCode: string, userId: string, choice: ValidChoices) {
    const currentSession = activeSessions[sessionCode]

    if (!currentSession) {
      throw new NotConnectedToSessionError()
    }

    const isPlayer1 = currentSession.player1Id === userId
    const isPlayer2 = currentSession.player2Id === userId

    if (!isPlayer1 && !isPlayer2) {
      throw new UnauthorizedSessionError()
    }

    if (!currentSession.player1Socket || !currentSession.player2Socket) {
      throw new OtherPlayerDisconnectedError()
    }

    if (!validChoices.includes(choice)) {
      throw new InvalidChoiceError()
    }

    if (isPlayer1) {
      currentSession.player1Choice = choice
    } else if (isPlayer2) {
      currentSession.player2Choice = choice
    }

    if (currentSession.player1Choice && currentSession.player2Choice) {
      this.resolveRound(currentSession)
    }
  }

  private resolveRound(session: SessionInfos) {
    const roundResult = this.getRoundResult(session.player1Choice!, session.player2Choice!)

    const resultMessages = {
      player1: {
        player1: "Win",
        player2: "Lose"
      },
      player2: {
        player1: "Lose",
        player2: "Win"
      },
      tie: {
        player1: "Tie",
        player2: "Tie"
      }
    }

    const messages = resultMessages[roundResult]

    session.player1Socket!.send(JSON.stringify({
      type: "result",
      message: messages.player1
    }))

    session.player2Socket!.send(JSON.stringify({
      type: "result",
      message: messages.player2
    }))

    session.player1Choice = undefined
    session.player2Choice = undefined
  }

  private getRoundResult(player1Choice: ValidChoices, player2Choice: ValidChoices): ResultOptions {
    if (player1Choice === player2Choice) {
      return "tie"
    }

    if ((player1Choice === 1 && player2Choice === 3) ||
      (player1Choice === 2 && player2Choice === 1) ||
      (player1Choice === 3 && player2Choice === 2)
    ) {
      return "player1"
    } else {
      return "player2"
    }
  }
}