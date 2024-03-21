import { EmailAlreadyExistsError } from "@/errors/email-already-exists-error"
import { InvalidCredentialsError } from "@/errors/invalid-credentials-error"
import { UsernameAlreadyExistsError } from "@/errors/username-already-exists-error"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"
import { compare, hash } from "bcryptjs"

interface RegisterUserRequest {
  username: string
  email: string
  password: string
}

interface UserReply {
  user: User
}

interface AuthenticateUserRequest {
  email: string
  password: string
}

export class UserService {
  async register({
    username,
    email,
    password
  }: RegisterUserRequest): Promise<UserReply> {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.findByEmail(email)

    const userWithSameUsername = await this.findByUsername(username)

    if (userWithSameEmail) {
      throw new EmailAlreadyExistsError()
    }

    if (userWithSameUsername) {
      throw new UsernameAlreadyExistsError()
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash
      }
    })

    return { user }
  }

  async authenticate({ email, password }: AuthenticateUserRequest): Promise<UserReply> {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, user.password_hash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return { user }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    })

    return user
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        username,
      }
    })

    return user
  }
}