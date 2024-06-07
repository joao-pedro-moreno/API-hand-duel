export class UserIdRequiredError extends Error {
  constructor() {
    super("User ID required!")
  }
}