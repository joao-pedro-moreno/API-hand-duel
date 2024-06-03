import { UserDao } from "@/daos/UserDao"
import { EmailAlreadyExistsError } from "@/errors/EmailAlreadyExistsError"
import { InvalidCredentialsError } from "@/errors/InvalidCredentialsError"
import { UserNotFoundError } from "@/errors/UserNotFoundError"
import { UsernameAlreadyExistsError } from "@/errors/UsernameAlreadyExistsError"
import { User } from "@prisma/client"
import { compare, hash } from "bcryptjs"

interface UserReply {
  user: User
}

interface AuthenticateUserRequest {
  email: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}


export class UserService {
  private userDao: UserDao

  constructor() {
    this.userDao = new UserDao()
  }

  async registerUser({ email, username, password }: RegisterData): Promise<UserReply> {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.userDao.findUserByEmail(email)

    const userWithSameUsername = await this.userDao.findUserByUsername(username)

    if (userWithSameEmail) {
      throw new EmailAlreadyExistsError()
    }

    if (userWithSameUsername) {
      throw new UsernameAlreadyExistsError()
    }

    const user = await this.userDao.registerUser({ username, email, password_hash })

    return user
  }

  async authenticateUser({ email, password }: AuthenticateUserRequest): Promise<UserReply> {
    const user = await this.userDao.findUserByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, user.password_hash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return { user }
  }

  async getUserProfile(id: string): Promise<User> {
    const user = await this.userDao.findUserById(id)

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }
}