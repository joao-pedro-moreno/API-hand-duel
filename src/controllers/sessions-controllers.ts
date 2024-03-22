import { SessionCodeAlreadyExistsError } from "@/errors/session-code-already-exists-error";
import { SessionIsFullError } from "@/errors/session-is-full-error";
import { SessionNotFoundError } from "@/errors/session-not-found-error";
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
    if (err instanceof SessionCodeAlreadyExistsError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof UserAlreadyInSessionError) {
      return reply.status(409).send({ message: err.message })
    }
  }
}

export async function joinSession(request: FastifyRequest, reply: FastifyReply) {
  const joinSessionParamsSchema = z.object({
    code: z.string().length(6)
  })

  const { code } = joinSessionParamsSchema.parse(request.params)

  const userId = request.user.sub

  try {
    const sessionService = new SessionService()

    const { session } = await sessionService.join({ code, userId })

    return reply.status(200).send({ session })
  } catch (err) {
    if (err instanceof SessionNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof UserAlreadyInSessionError || err instanceof SessionIsFullError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}