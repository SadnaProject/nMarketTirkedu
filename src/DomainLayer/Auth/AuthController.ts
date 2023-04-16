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
   * @param guestId The user's ID.(The id of the guest user that was created when the user connected to the system and preforms the login)
   * @param email The user's email.
   * @param password The user's password.
   * @returns The user's ID.
   */
  login(guestId: string, email: string, password: string): string;
  /**
   * disconnects a user. if the user is a guest user, the user is removed from the system. if the user is a member user, the users session is invalidated. 
   * @param userId The user's ID.
   * @throws Error if the user is not connected.
   */

  disconnect(userId: string): void;
  /**
   * Registers a new user.
   * @param email The user's email.
   * @param password The user's password.
   * @throws Error if the email is already in use.
   * @throws Error if the password is invalid.
   * @returns The user's ID.
   */
  register(email: string, password: string): string;
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
  /**
   * Logs out a logged in member user.
   * @param userId The user's ID.
   * @throws Error if the user is not connected or not a user
   * @returns The new guest user's ID.(After the logout the user is a guest user again)
    */
  logout(userId: string): string
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

  public startSession(): string {
    // throw new Error("Method not implemented.");
    const guest = GuestUserAuth.create();
    this.Repos.Users.addGuest(guest);
    return guest.UserId;
  }

  public login(guestId: string, email: string, password: string): string {
    // throw new Error("Method not implemented.");
    const member: MemberUserAuth = this.Repos.Users.getMemberByEmail(email);
    if(!member.isPasswordCorrect(password)){
      throw new Error("Password is incorrect, please try again with a different password");
    }
    member.login();
    this.Repos.Users.removeGuest(guestId);
    return member.UserId;
  }
  public disconnect(userId: string): void {
    //TODO - do i need to call the logout method of the users component?
    if(this.isGuest(userId)){
      this.Repos.Users.removeGuest(userId);
      return;
    }
    else{
      const member: MemberUserAuth = this.Repos.Users.getMemberById(userId);
      
      member.logout();//throws error if user is not connected
    }
  }
  public logout(userId: string): string {
    if(this.isGuest(userId)){
      throw new Error("User is not a member, please try again with a different user");
    }
    const member: MemberUserAuth= this.Repos.Users.getMemberById(userId);
    member.logout();//throws error if user is not connected
    return this.startSession();
  }
  public register(email: string, password: string): string {
    // throw new Error("Method not implemented.");
    if(this.Repos.Users.doesMemberExistByEmail(email)){
      throw new Error("Email already in use, please try again with a different email");  
    }
    // if(!this.validatePassword(password)){
    //   throw new Error("Password is invalid, please try again with a different password");
    // }
    const ua= MemberUserAuth.create(email,password);
    this.Repos.Users.addMember(ua);
    return ua.UserId;
  }
  
  public changeEmail(userId: string, newEmail: string): void {
    // throw new Error("Method not implemented.");
    const member = this.Repos.Users.getMemberById(userId);
    if(this.Repos.Users.doesMemberExistByEmail(newEmail)){
      throw new Error("Email already in use, please try again with a different email");  
    }
    member.Email=newEmail;
  }
  public changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): void {
    // throw new Error("Method not implemented.");
    const member: MemberUserAuth = this.Repos.Users.getMemberById(userId); 
    if(!member.isPasswordCorrect(oldPassword)){
      throw new Error("Password is incorrect, please try again with a different password");
    }
    member.Password=newPassword;
  }
  public isGuest(userId: string): boolean {
    if(this.Repos.Users.getGuestById(userId) !== undefined){
      return true;
    }
    return false;
  }
  public isMember(userId: string): boolean {
    
    if(this.Repos.Users.doesMemberExistById(userId)){
      return true;
    }
    return false;
  }
  public isConnected(userId: string): boolean {
    const guest: GuestUserAuth | undefined = this.Repos.Users.getGuestById(userId);
    if(guest !== undefined){
      return guest.isUserLoggedInAsGuest();
    }
    if(!this.Repos.Users.doesMemberExistById(userId))
      return false;
    const member: MemberUserAuth = this.Repos.Users.getMemberById(userId);
    return member.isUserLoggedInAsMember();
  }
}