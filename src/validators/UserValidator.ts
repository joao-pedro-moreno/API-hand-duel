import { BadRequestError } from "@/errors/bad-request-error"
import { FastifyRequest } from "fastify"
import { z } from "zod"

interface RegisterRequest {
  username: string
  email: string
  password: string
}

export class UserValidator {
  validateRegisterRequest(request: FastifyRequest): RegisterRequest {
    try {
      const registerBodySchema = z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      })

      const requestBody = registerBodySchema.parse(request.body)

      return requestBody
    } catch (err) {
      throw new BadRequestError()
    }
  }
}