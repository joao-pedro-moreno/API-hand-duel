export class UserAlreadyInSessionError extends Error {
  constructor() {
    super("User is already in a session!")
  }
}