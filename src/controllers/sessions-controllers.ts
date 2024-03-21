import { SessionCodeAlreadyExistsError } from "@/errors/session-code-already-exists-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createSession(request: FastifyRequest, reply: FastifyReply) {
  const createSessionBodySchema = z.object({
    code: z.string().length(6)
  })

  const { code } = createSessionBodySchema.parse(request.body)

  const userid = request.user.sub

  try {

  }
} 