export class SessionIsFullError extends Error {
  constructor() {
    super("Session is full.")
  }
}