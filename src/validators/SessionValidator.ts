import { InvalidCodeFormatError } from "@/errors/InvalidCodeFormatError";
import { BadRequestError } from "@/errors/BadRequestError";
import { FastifyRequest } from "fastify";
import { z } from "zod";

interface CreateSessionRequest {
  code: string
  rounds: number
}

export class SessionValidator {
  validateCreateSessionRequest(request: FastifyRequest): CreateSessionRequest {
    try {
      const createSessionBodySchema = z.object({
        code: z.string().length(6),
        rounds: z.number()
      })

      const requestBody = createSessionBodySchema.parse(request.body)

      return requestBody
    } catch (err) {
      throw new BadRequestError()
    }
  }

  validateSessionCodeFormat(request?: FastifyRequest, code?: string): string {
    try {
      let validatedCode = ""

      const codeFormatSchema = z.object({
        code: z.string().length(6)
      })

      if (code) {
        validatedCode = codeFormatSchema.parse(code)["code"]
      }

      if (request) {
        validatedCode = codeFormatSchema.parse(request.params)["code"]
      }

      return validatedCode
    } catch (err) {
      throw new InvalidCodeFormatError()
    }
  }

  validateSocketCode(request: FastifyRequest): string {
    const codeFormatSchema = z.object({
      code: z.string().length(6)
    })

    const validatedCode = codeFormatSchema.parse(request.query)["code"]

    return validatedCode
  }
}