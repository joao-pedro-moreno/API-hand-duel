import { EmailAlreadyExistsError } from "@/errors/email-already-exists-error";
import { UsernameAlreadyExistsError } from "@/errors/username-already-exists-error";
import { UserService } from "@/services/user-services";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { username, email, password } = registerBodySchema.parse(request.body)

  try {
    const userService = new UserService()

    const { user } = await userService.register({ username, email, password })

    const token = await reply.jwtSign({}, {
      sign: {
        sub: user.id
      }
    })

    const refreshToken = await reply.jwtSign({}, {
      sign: {
        sub: user.id,
        expiresIn: "7d",
      }
    })

    return reply
      .status(201)
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        sameSite: true,
        httpOnly: true
      })
      .send({ token })

  } catch (err) {
    if (err instanceof UsernameAlreadyExistsError || err instanceof EmailAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}