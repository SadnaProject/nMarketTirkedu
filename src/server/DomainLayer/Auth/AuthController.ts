interface IAuthController {
  /**
   * Returns true if the provided userId is a guest user.
   * @param userId
   */

  isGuest(userId: string): boolean;
  /**
   * Checks if a user is a member of the group.
   * @param userId: string
   * @return boolean
   */

  isMember(userId: string): boolean;
  /**
   * Checks whether the user is connected to the system.
   * @param userId The user ID.
   * @returns True if the user is connected, false otherwise.
   */

  isConnected(userId: string): boolean;
  /**
   * Logs in a user.
   * @param email The user's email.
   * @param password The user's password.
   * @returns The user's ID.
   */
  login(email: string, password: string): string;
  /**
   * Logs out the user.
   * @param userId The user's ID.
   * @throws Error if the user is not connected.
   */

  logout(userId: string): void;
  /**
   * Registers a new user.
   * @param email The user's email.
   * @param password The user's password.
   * @throws Error if the email is already in use.
   * @throws Error if the password is invalid.
   */
  register(email: string, password: string): void;
  /**
   * Changes the user's email.
   * @param userId The user's ID.
   * @param newEmail The new email.
   * @throws Error if the email is already in use.
   */
  changeEmail(userId: string, newEmail: string): void;
  /**
   * Changes the user's password.
   * @param userId The user's ID.
   * @param oldPassword The old password.
   * @param newPassword The new password.
   * @throws Error if the old password is incorrect.
   * @throws Error if the new password is invalid.
   */
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): void;
}

export class AuthController implements IAuthController {
  login(email: string, password: string): string {
    throw new Error("Method not implemented.");
  }
  logout(userId: string): void {
    throw new Error("Method not implemented.");
  }
  register(email: string, password: string): void {
    throw new Error("Method not implemented.");
  }
  changeEmail(userId: string, newEmail: string): boolean {
    throw new Error("Method not implemented.");
  }
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): boolean {
    throw new Error("Method not implemented.");
  }
  isGuest(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isMember(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isConnected(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
}
