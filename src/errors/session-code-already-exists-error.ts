export class SessionCodeAlreadyExistsError extends Error {
  constructor() {
    super("Session code already exists!")
  }
}