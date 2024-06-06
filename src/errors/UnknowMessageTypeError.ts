export class UnknowMessageTypeError extends Error {
  constructor() {
    super("Unknown message type!")
  }
}