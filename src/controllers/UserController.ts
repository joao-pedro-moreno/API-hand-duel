import { BadRequestError } from "@/errors/bad-request-error";
import { EmailAlreadyExistsError } from "@/errors/email-already-exists-error";
import { InvalidCredentialsError } from "@/errors/invalid-credentials-error";
import { UsernameAlreadyExistsError } from "@/errors/username-already-exists-error";
import { UserService } from "@/services/UserService";
import { UserValidator } from "@/validators/UserValidator";
import { FastifyReply, FastifyRequest } from "fastify";

export async function registerUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username, email, password } = new UserValidator().validateRegisterRequest(request)

    const userService = new UserService()

    const { user } = await userService.registerUser({ username, email, password })

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

    if (err instanceof BadRequestError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}

export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = new UserValidator().validateAuthenticacteRequest(request)

    const userService = new UserService()

    const { user } = await userService.authenticate({ email, password })

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
      .status(200)
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        sameSite: true,
        httpOnly: true
      })
      .send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: err.message })
    }
    throw err
  }
}

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const userService = new UserService()

  const user = await userService.findById(request.user.sub)

  return reply.status(200).send({
    user: {
      ...user,
      password_hash: undefined
    }
  })
}