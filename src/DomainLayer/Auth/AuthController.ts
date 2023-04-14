import { Mixin } from "ts-mixer";
import { HasControllers } from "../HasController";
import { Testable, testable } from "~/Testable";
import { HasRepos } from "./HasRepos";
import { createRepos } from "./HasRepos";
import { UserAuth } from "./UserAuth";
import { GuestUserAuth,GuestUserAuthDTO } from "./GuestUserAuth";
import { MemberUserAuth,MemberUserAuthDTO } from "./MemberUserAuth";

export interface IAuthController extends HasRepos {
  /**
   * Starts a new session. This method should be called when a new user connects to the system.
   * The user is signed in as a guest user and is assigned a new session.
   * @returns The user's ID(Notice this is the id only for this session as the user is a guest in this time).
   */
  startSession(): string;
  /**
   * Returns true if the provided userId is a guest user.
   * @param userId
   */

  isGuest(userId: string): boolean;
  /**
   * Checks if a user is a member of the group.
   * @param userId: String.
   * @returns Boolean.
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

@testable
export class AuthController
  extends Mixin(Testable, HasControllers,HasRepos)
  implements IAuthController
{
  constructor() {
    super();
    this.initRepos(createRepos());
  }

  startSession(): string {
    // throw new Error("Method not implemented.");
    const guest = GuestUserAuth.create();
    this.Repos.Users.addGuest(guest.DTO);
    return guest.UserId;
  }

  login(email: string, password: string): string {
    throw new Error("Method not implemented.");
  }
  logout(userId: string): void {
    throw new Error("Method not implemented.");
  }
  register(email: string, password: string): void {
    // throw new Error("Method not implemented.");

  }
  
  // private validatePassword(password: string): boolean {
  //   return true;
  // }
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
