export class OtherPlayerDisconnectedError extends Error {
  constructor() {
    super("Other player disconnected!")
  }
}