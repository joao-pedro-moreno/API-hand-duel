import { prisma } from "@/lib/prisma"
import { ActiveSession } from "@prisma/client"

interface CreateSessionRequest {
  code: string
  userId: string
}

interface ActiveSessionResponse {
  session: ActiveSession
}

export class SessionService {
  async create({ code, userId }: CreateSessionRequest): Promise<ActiveSessionResponse> {
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
      throw new 
    }
  }
}