import { SessionCodeAlreadyExistsError } from "@/errors/SessionCodeAlreadyExistsError"
import { SessionIsFullError } from "@/errors/SessionIsFullError"
import { SessionNotFoundError } from "@/errors/SessionNotFoundError"
import { UserAlreadyInSessionError } from "@/errors/UserAlreadyInSessionError"
import { UserNotFoundError } from "@/errors/UserNotFoundError"
import { prisma } from "@/lib/prisma"
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
  async create({ code, userId, rounds }: CreateSessionRequest): Promise<ActiveSessionResponse> {
    const sessionWithSameCode = await prisma.activeSession.findUnique({
      where: {
        code
      }
    })

    if (sessionWithSameCode) {
      throw new SessionCodeAlreadyExistsError()
    }

    const sessionsWithTheSamePlayer = await prisma.activeSession.findMany({
      where: {
        OR: [
          {
            player1Id: userId
          },
          {
            player2Id: userId
          }
        ]
      }
    })

    if (sessionsWithTheSamePlayer.length > 0) {
      throw new UserAlreadyInSessionError()
    }

    const session = await prisma.activeSession.create({
      data: {
        code,
        player1Id: userId,
        rounds
      }
    })

    return { session }
  }

  async join({ code, userId }: JoinSessionRequest): Promise<ActiveSessionResponse> {
    const requestedSession = await prisma.activeSession.findUnique({
      where: {
        code
      }
    })

    if (!requestedSession) {
      throw new SessionNotFoundError()
    }

    const sessionsWithTheSamePlayer = await prisma.activeSession.findMany({
      where: {
        OR: [
          {
            player1Id: userId,
          },
          {
            player2Id: userId
          }
        ]
      }
    })

    if (sessionsWithTheSamePlayer.length > 0) {
      throw new UserAlreadyInSessionError()
    }

    const sessionAlreadyHasPlayer2 = requestedSession.player2Id

    if (sessionAlreadyHasPlayer2) {
      throw new SessionIsFullError()
    }

    const session = await prisma.activeSession.update({
      where: { code },
      data: { player2Id: userId }
    })

    return { session }
  }

  async listActiveSessions(): Promise<ActiveSession[] | null> {
    const sessions = await prisma.activeSession.findMany()

    return sessions
  }

  async findByOwnerUsername({ username }: SearchSessionRequest): Promise<ActiveSession | null> {
    const user = await prisma.user.findUnique({
      where: {
        username
      }
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    const userSession = await prisma.activeSession.findFirstOrThrow({
      where: {
        OR: [
          { player1Id: user.id },
        ]
      }
    })

    if (!userSession) {
      throw new SessionNotFoundError()
    }

    return userSession
  }
}