import { SessionCodeAlreadyExistsError } from "@/errors/session-code-already-exists-error"
import { UserAlreadyInSessionError } from "@/errors/user-already-in-session"
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
}