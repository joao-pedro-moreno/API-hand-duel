import { SessionCodeAlreadyExistsError } from "@/errors/session-code-already-exists-error";
import { UserAlreadyInSessionError } from "@/errors/user-already-in-session";
import { SessionService } from "@/services/session-service";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createSession(request: FastifyRequest, reply: FastifyReply) {
  const createSessionBodySchema = z.object({
    code: z.string().length(6),
    rounds: z.number()
  })

  const { code, rounds } = createSessionBodySchema.parse(request.body)

  const userId = request.user.sub

  try {
    const sessionService = new SessionService()

    const { session } = await sessionService.create({ code, userId, rounds })

    return reply.status(201).send({ session })
  } catch (err) {
    if (err instanceof UserAlreadyInSessionError || err instanceof SessionCodeAlreadyExistsError) {
      return reply.status(400).send({ message: err.message })
    }
  }
} 