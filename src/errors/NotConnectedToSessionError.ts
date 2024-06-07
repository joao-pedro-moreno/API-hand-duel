export class NotConnectedToSessionError extends Error {
  constructor() {
    super("You must be connected to a session!")
  }
}