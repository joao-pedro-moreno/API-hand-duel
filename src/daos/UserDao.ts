import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

interface RegisterUserRequest {
  username: string
  email: string
  password_hash: string
}

interface UserReply {
  user: User
}

export class UserDao {
  async registerUser({ username, email, password_hash }: RegisterUserRequest): Promise<UserReply> {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash
      }
    })

    return { user }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    return user
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        username
      }
    })

    return user
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    })

    return user
  }
}