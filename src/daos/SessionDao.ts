import { prisma } from "@/lib/prisma"
import { ActiveSession } from "@prisma/client"

interface Session {
  code: string
  userId: string
  rounds: number
}

export class SessionDao {
  async createSession({ code, userId, rounds }: Session): Promise<ActiveSession> {
    const session = await prisma.activeSession.create({
      data: {
        code,
        player1Id: userId,
        rounds
      }
    })

    return session
  }

  async findSessionByCode(code: string): Promise<ActiveSession | null> {
    const session = await prisma.activeSession.findUnique({
      where: {
        code,
      }
    })

    return session
  }

  async findSessionByPlayerId(userId: string): Promise<ActiveSession[] | null> {
    const session = await prisma.activeSession.findMany({
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

    return session
  }

  async findSessionByOwnerUserId(userId: string): Promise<ActiveSession | null> {
    const session = await prisma.activeSession.findFirstOrThrow({
      where: {
        player1Id: userId
      }
    })

    return session
  }

  async insertUserToSessionAsSecondPlayer(userId: string, code: string): Promise<ActiveSession> {
    const session = await prisma.activeSession.update({
      where: {
        code
      },
      data: {
        player2Id: userId
      }
    })

    return session
  }

  async getAllActiveSessions(): Promise<ActiveSession[]> {
    const sessions = await prisma.activeSession.findMany()

    return sessions
  }
}