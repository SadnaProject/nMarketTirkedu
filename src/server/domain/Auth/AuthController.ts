import { Mixin } from "ts-mixer";
import { HasControllers } from "../_HasController";
import { Testable, testable } from "server/domain/_Testable";
import { HasRepos } from "./_HasRepos";
import { createRepos } from "./_HasRepos";
import { UserAuth } from "./UserAuth";
import { GuestUserAuth, GuestUserAuthDTO } from "./GuestUserAuth";
import { MemberUserAuth, MemberUserAuthDTO } from "./MemberUserAuth";
import { TRPCError } from "@trpc/server";
import { prng } from "next/dist/shared/lib/bloom-filter/base-filter";

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

  isMember(userId: string): Promise<boolean>;
  /**
   * Checks whether the user is connected to the system.
   * @param userId The user ID.
   * @returns True if the user is connected, false otherwise.
   */

  isConnected(userId: string): Promise<boolean>;
  /**
   * Logs in a user.
   * @param guestId The user's ID.(The id of the guest user that was created when the user connected to the system and preforms the login).
   * @param email The user's email.
   * @param password The user's password.
   * @returns The user's ID.
   */
  login(guestId: string, email: string, password: string): Promise<string>;
  /**
   * Disconnects a user. If the user is a guest user, the user is removed from the system. If the user is a member user, the users session is invalidated.
   * @param userId The user's ID.
   * @throws Error if the user is not connected.
   */

  disconnect(userId: string): Promise<void>;
  /**
   * Registers a new user.
   * @param email The user's email.
   * @param password The user's password.
   * @returns The user's ID.
   * @throws Error if the email is already in use.
   * @throws Error if the password is invalid.
   */
  register(email: string, password: string): Promise<string>;
  /**
   * Changes the user's email.
   * @param userId The user's ID.
   * @param newEmail The new email.
   * @throws Error if the email is already in use.
   */
  changeEmail(userId: string, newEmail: string): Promise<void>;
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
  ): Promise<void>;
  /**
   * Logs out a logged in member user.
   * @param userId The user's ID.
   * @returns The new guest user's ID.(After the logout the user is a guest user again).
   * @throws Error if the user is not connected or not a user.
   */
  logout(userId: string): Promise<string>;
  /**
   *
   * @param userIdOfActor The user id of the user that asks to remove the member.
   * @param memberIdToRemove The user id of the member to remove.
   * @throws Error if the asking user doesnt have the permission to remove the member(i.e the asking user is not the system admin).
   * @throws Error if the member to remove is not a member.
   * @throws Error if the member has any position(he cant be removed if he has any position).
   */
  removeMember(userIdOfActor: string, memberIdToRemove: string): Promise<void>;
  /**
   * Returns all the logged in members ids.
   * @returns Array of strings.
   */
  getAllLoggedInMembersIds(): Promise<string[]>;
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  getAllLoggedOutMembersIds(): Promise<string[]>;
}

@testable
export class AuthController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IAuthController
{
  constructor() {
    super();
    this.initRepos(createRepos());
  }

  public startSession(): string {
    // throw new Error("Method not implemented.");
    const guest = GuestUserAuth.create();
    this.Repos.Users.addGuest(guest);
    return guest.UserId;
  }

  public async login(
    guestId: string,
    email: string,
    password: string
  ): Promise<string> {
    // throw new Error("Method not implemented.");
    const member: MemberUserAuth = await this.Repos.Users.getMemberByEmail(
      email
    );
    if (!member.isPasswordCorrect(password)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Password is incorrect, please try again with a different password",
      });
    }
    member.login();
    this.Repos.Users.removeGuest(guestId);
    return member.UserId;
  }
  public async disconnect(userId: string): Promise<void> {
    if (this.isGuest(userId)) {
      this.Repos.Users.removeGuest(userId);
      return;
    } else {
      const member: MemberUserAuth = await this.Repos.Users.getMemberById(
        userId
      );

      member.logout(); //throws error if user is not connected
    }
  }
  public async logout(userId: string): Promise<string> {
    if (this.isGuest(userId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not a member, please try again with a different user",
      });
    }
    const member: MemberUserAuth = await this.Repos.Users.getMemberById(userId);
    member.logout(); //throws error if user is not connected
    return this.startSession();
  }
  public async register(email: string, password: string): Promise<string> {
    // throw new Error("Method not implemented.");
    if (await this.Repos.Users.doesMemberExistByEmail(email)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Email already in use, please try again with a different email",
      });
    }
    // if(!this.validatePassword(password)){
    //   throw new Error("Password is invalid, please try again with a different password");
    // }
    const ua = MemberUserAuth.create(email, password);
    await this.Repos.Users.addMember(ua);
    return ua.UserId;
  }

  public async changeEmail(userId: string, newEmail: string): Promise<void> {
    // throw new Error("Method not implemented.");
    const member = await this.Repos.Users.getMemberById(userId);
    if (await this.Repos.Users.doesMemberExistByEmail(newEmail)) {
      //TODO: this maybe needs to be await
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Email already in use, please try again with a different email",
      });
    }
    member.Email = newEmail;
  }
  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // throw new Error("Method not implemented.");
    const member: MemberUserAuth = await this.Repos.Users.getMemberById(userId);
    if (!member.isPasswordCorrect(oldPassword)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Password is incorrect, please try again with a different password",
      });
    }
    member.Password = newPassword;
  }
  public isGuest(userId: string): boolean {
    return this.Repos.Users.doesGuestExistById(userId);
  }
  public async isMember(userId: string): Promise<boolean> {
    if (await this.Repos.Users.doesMemberExistById(userId)) {
      return true;
    }
    return false;
  }

  public async isConnected(userId: string): Promise<boolean> {
    if (this.Repos.Users.doesGuestExistById(userId)) {
      return this.Repos.Users.getGuestById(userId).isUserLoggedInAsGuest();
    }
    if (!(await this.Repos.Users.doesMemberExistById(userId))) return false;
    const member: MemberUserAuth = await this.Repos.Users.getMemberById(userId);
    return member.isUserLoggedInAsMember();
    return true;
  }
  public async removeMember(
    userIdOfActor: string,
    memberIdToRemove: string
  ): Promise<void> {
    if (!(await this.isMember(memberIdToRemove))) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Given user id doesn't belong to a member",
      });
    }

    await this.Repos.Users.removeMember(memberIdToRemove);
  }
  public async getAllLoggedInMembersIds(): Promise<string[]> {
    // throw new Error("Method not implemented.");
    const loggedInUsersIds: string[] = [];
    const members = await this.Repos.Users.getAllMembers();
    members.forEach((member) => {
      if (member.isUserLoggedInAsMember()) {
        loggedInUsersIds.push(member.UserId);
      }
    });
    return loggedInUsersIds;
  }
  public async getAllLoggedOutMembersIds(): Promise<string[]> {
    // throw new Error("Method not implemented.");
    const loggedOutUsersIds: string[] = [];
    const members = await this.Repos.Users.getAllMembers();
    members.forEach((member) => {
      if (!member.isUserLoggedInAsMember()) {
        loggedOutUsersIds.push(member.UserId);
      }
    });
    return loggedOutUsersIds;
  }
}
