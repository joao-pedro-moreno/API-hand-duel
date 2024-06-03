export class CannotDeleteAccount extends Error {
  constructor() {
    super("Cannot delete account!")
  }
}