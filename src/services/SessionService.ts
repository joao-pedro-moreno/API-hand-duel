import { SessionDao } from "@/daos/SessionDao"
import { UserDao } from "@/daos/UserDao"
import { SessionCodeAlreadyExistsError } from "@/errors/SessionCodeAlreadyExistsError"
import { SessionIsFullError } from "@/errors/SessionIsFullError"
import { SessionNotFoundError } from "@/errors/SessionNotFoundError"
import { UserAlreadyInSessionError } from "@/errors/UserAlreadyInSessionError"
import { UserNotFoundError } from "@/errors/UserNotFoundError"
import { ActiveSession } from "@prisma/client"

interface CreateSessionRequest {
  code: string
  userId: string
  rounds: number
}

interface ActiveSessionResponse {
  session: ActiveSession
}

interface JoinSessionRequest {
  code: string
  userId: string
}

interface SearchSessionRequest {
  username: string
}

export class SessionService {
  private sessionDao: SessionDao

  constructor() {
    this.sessionDao = new SessionDao()
  }

  async createSession({ code, userId, rounds }: CreateSessionRequest): Promise<ActiveSessionResponse> {
    const sessionWithSameCode = await this.sessionDao.findSessionByCode(code)

    if (sessionWithSameCode) {
      throw new SessionCodeAlreadyExistsError()
    }

    const sessionsWithThisUser = await this.sessionDao.findSessionByPlayerId(userId)

    if (sessionsWithThisUser && sessionsWithThisUser.length > 0) {
      throw new UserAlreadyInSessionError()
    }

    const session = await this.sessionDao.createSession({ code, userId, rounds })

    return { session }
  }

  async joinSession({ code, userId }: JoinSessionRequest): Promise<ActiveSessionResponse> {
    const requestedSession = await this.sessionDao.findSessionByCode(code)

    if (!requestedSession) {
      throw new SessionNotFoundError()
    }

    const sessionsWithThisUser = await this.sessionDao.findSessionByPlayerId(userId)

    if (sessionsWithThisUser && sessionsWithThisUser.length > 0) {
      throw new UserAlreadyInSessionError()
    }

    const sessionAlreadyHasPlayer2 = requestedSession.player2Id

    if (sessionAlreadyHasPlayer2) {
      throw new SessionIsFullError()
    }

    const session = await this.sessionDao.insertUserToSessionAsSecondPlayer(userId, code)

    return { session }
  }

  async listActiveSessions(): Promise<ActiveSession[] | null> {
    const sessions = await this.sessionDao.getAllActiveSessions()

    return sessions
  }

  async findSessionByOwnerUsername({ username }: SearchSessionRequest): Promise<ActiveSession | null> {
    const user = await new UserDao().findUserByUsername(username)

    if (!user) {
      throw new UserNotFoundError()
    }

    const userSession = await this.sessionDao.findSessionByOwnerUserId(user.id)

    if (!userSession) {
      throw new SessionNotFoundError()
    }

    return userSession
  }
}