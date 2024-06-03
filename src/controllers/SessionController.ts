import { InvalidCodeFormatError } from "@/errors/InvalidCodeFormatError";
import { SessionCodeAlreadyExistsError } from "@/errors/SessionCodeAlreadyExistsError";
import { SessionIsFullError } from "@/errors/SessionIsFullError";
import { SessionNotFoundError } from "@/errors/SessionNotFoundError";
import { UserAlreadyInSessionError } from "@/errors/UserAlreadyInSessionError";
import { UserNotFoundError } from "@/errors/UserNotFoundError";
import { SessionService } from "@/services/SessionService";
import { SessionValidator } from "@/validators/SessionValidator";
import { UserValidator } from "@/validators/UserValidator";
import { FastifyReply, FastifyRequest } from "fastify";

export async function createSession(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { code, rounds } = new SessionValidator().validateCreateSessionRequest(request)

    const userId = request.user.sub

    const sessionService = new SessionService()

    const { session } = await sessionService.createSession({ code, userId, rounds })

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
  try {
    const code = new SessionValidator().validateSessionCodeFormat(request)

    const userId = request.user.sub

    const sessionService = new SessionService()

    const { session } = await sessionService.joinSession({ code, userId })

    return reply.status(200).send({ session })
  } catch (err) {
    if (err instanceof SessionNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof UserAlreadyInSessionError || err instanceof SessionIsFullError) {
      return reply.status(409).send({ message: err.message })
    }

    if (err instanceof InvalidCodeFormatError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}

export async function listActiveSessions(request: FastifyRequest, reply: FastifyReply) {
  const sessionService = new SessionService()

  const sessions = await sessionService.listActiveSessions()

  return reply.status(200).send({ sessions })
}

export async function getSessionByOwnerUsername(request: FastifyRequest, reply: FastifyReply) {
  try {
    const username = new UserValidator().validateUsername(request)

    const sessionService = new SessionService()

    const session = await sessionService.findSessionByOwnerUsername({ username })

    return reply.status(200).send({ session })
  } catch (err) {
    if (err instanceof UserNotFoundError || err instanceof SessionNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}