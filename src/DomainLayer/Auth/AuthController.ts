import { Mixin } from "ts-mixer";
import { HasControllers } from "../HasController";
import { Testable, testable } from "~/Testable";
import { HasRepos } from "./HasRepos";
import { createRepos } from "./HasRepos";
import { UserAuth } from "./UserAuth";

export interface IAuthController extends HasRepos {
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

  login(email: string, password: string): string {
    throw new Error("Method not implemented.");
  }
  logout(userId: string): void {
    throw new Error("Method not implemented.");
  }
  register(email: string, password: string): void {
    // throw new Error("Method not implemented.");
    if(this.Repos.Users.getUserByEmail(email) !== undefined){
      throw new Error("Email already in use, please try again with a different email");  
    }
    // if(!this.validatePassword(password)){
    //   throw new Error("Password is invalid, please try again with a different password");
    // }
    const ua= new UserAuth("MEMBER",email,password);
    this.Repos.Users.addUser(ua.DTO);

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
