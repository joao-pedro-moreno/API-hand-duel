export class UnauthorizedSessionError extends Error {
  constructor() {
    super("Unauthorized to enter this session!")
  }
}