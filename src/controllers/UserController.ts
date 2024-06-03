import { BadRequestError } from "@/errors/BadRequestError";
import { CannotDeleteAccount } from "@/errors/CannotDeleteAccount";
import { EmailAlreadyExistsError } from "@/errors/EmailAlreadyExistsError";
import { InvalidCredentialsError } from "@/errors/InvalidCredentialsError";
import { UserNotFoundError } from "@/errors/UserNotFoundError";
import { UsernameAlreadyExistsError } from "@/errors/UsernameAlreadyExistsError";
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

    const { user } = await userService.authenticateUser({ email, password })

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

export async function getUserProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userService = new UserService()

    const user = await userService.getUserProfile(request.user.sub)

    return reply.status(200).send({
      user: {
        ...user,
        password_hash: undefined
      }
    })
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    new UserService().deleteUser(request.user.sub)

    return reply.status(204)
      .clearCookie("refreshToken")
      .send()
  } catch (err) {
    if (err instanceof CannotDeleteAccount) {
      return reply.status(403).send({ message: err.message })
    }

    throw err
  }
}