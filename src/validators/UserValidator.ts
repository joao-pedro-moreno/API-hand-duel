import { BadRequestError } from "@/errors/BadRequestError"
import { FastifyRequest } from "fastify"
import { z } from "zod"

interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthenticateRequest {
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

  validateAuthenticacteRequest(request: FastifyRequest): AuthenticateRequest {
    try {
      const authenticateBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })

      const requestBody = authenticateBodySchema.parse(request.body)

      return requestBody
    } catch (err) {
      throw new BadRequestError()
    }
  }

  validateUsername(request?: FastifyRequest, username?: string): string {
    let validatedUsername = ""

    const usernameSchema = z.object({
      username: z.string()
    })

    if (request) {
      validatedUsername = usernameSchema.parse(request.body)["username"]
    }

    if (username) {
      validatedUsername = usernameSchema.parse(username)["username"]
    }

    return validatedUsername
  }
}