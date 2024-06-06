export class SessionCodeRequiredError extends Error {
  constructor() {
    super("Session code required!")
  }
}