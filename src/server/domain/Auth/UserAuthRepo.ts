import { Testable, testable } from "server/domain/_Testable";
import type { MemberUserAuth } from "./MemberUserAuth";
import type { GuestUserAuth } from "./GuestUserAuth";

@testable
export class UserAuthRepo extends Testable {
  private members: MemberUserAuth[];
  private guests: GuestUserAuth[];

  constructor() {
    super();
    this.members = [];
    this.guests = [];
  }
  //member related methods
  public addMember(user: MemberUserAuth): void {
    this.members.push(user);
  }
  public getMemberByEmail(email: string): MemberUserAuth {
    const user = this.members.find((user) => user.Email === email);
    if (user === undefined)
      throw new Error("User with email: " + email + " not found");
    return user;
  }
  public getMemberById(userId: string): MemberUserAuth {
    const user = this.members.find((user) => user.UserId === userId);
    if (user === undefined)
      throw new Error("User with id: " + userId + " not found");
    return user;
  }
  public doesMemberExistByEmail(email: string): boolean {
    return this.members.some((user) => user.Email === email);
  }
  public doesMemberExistById(userId: string): boolean {
    return this.members.some((user) => user.UserId === userId);
  }

  public removeMember(userId: string): void {
    if (!this.doesMemberExistById(userId))
      throw new Error("User with id: " + userId + " not found");
    this.members = this.members.filter((user) => user.UserId !== userId);
  }
  public getAllMembers(): MemberUserAuth[] {
    return this.members;
  }
  public getAllMemberEmails(): string[] {
    return this.members.map((user) => user.Email);
  }
  //guest related methods
  public addGuest(user: GuestUserAuth): void {
    this.guests.push(user);
  }
  public getGuestById(userId: string): GuestUserAuth {
    const user = this.guests.find((user) => user.UserId === userId);
    if (user === undefined)
      throw new Error("User with id: " + userId + " not found");
    return user;
  }
  public doesGuestExistById(userId: string): boolean {
    return this.guests.some((user) => user.UserId === userId);
  }
  public removeGuest(userId: string): void {
    if (!this.doesGuestExistById(userId))
      throw new Error("User with id: " + userId + " not found");
    this.guests = this.guests.filter((user) => user.UserId !== userId);
  }
  //This is of course only the connected guests
  public getAllGuests(): GuestUserAuth[] {
    return this.guests;
  }
}
