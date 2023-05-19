import { Testable, testable } from "server/domain/_Testable";
import { MemberUserAuth } from "./MemberUserAuth";
import type { GuestUserAuth } from "./GuestUserAuth";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";

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
  public async addMember(user: MemberUserAuth): Promise<void> {
    this.members.push(user);
    //add to db
    await db.userAuth.create({
      data: { id: user.UserId, email: user.Email, password: user.Password },
    });
  }
  public async getMemberByEmail(email: string): Promise<MemberUserAuth> {
    const user = this.members.find((user) => user.Email === email);
    if (user === undefined) {
      //look in db
      const user = await db.userAuth.findUnique({ where: { email: email } });
      if (user === null)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user with email: " + email + " not found",
        });
      else return MemberUserAuth.createFromDTO(user);
    }
    return user;
  }
  private async getMemberByEmailFromDB(email: string): Promise<MemberUserAuth> {
    //look in db
    const user = await db.userAuth.findUnique({ where: { email: email } });
    if (user === null)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user with email: " + email + " not found",
      });
    else return MemberUserAuth.createFromDTO(user);
  }
  public async getMemberById(userId: string): Promise<MemberUserAuth> {
    const user = this.members.find((user) => user.UserId === userId);
    if (user === undefined) {
      //look in db
      const user = await db.userAuth.findUnique({ where: { id: userId } });
      if (user === null)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user with id: " + userId + " not found",
        });
      else return MemberUserAuth.createFromDTO(user);
    }

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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user with id: " + userId + " not found",
      });
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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User with id: " + userId + " not found",
      });
    return user;
  }
  public doesGuestExistById(userId: string): boolean {
    return this.guests.some((user) => user.UserId === userId);
  }
  public removeGuest(userId: string): void {
    if (!this.doesGuestExistById(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User with id: " +
          userId +
          " is not a guest, please try again with a different user",
      });
    this.guests = this.guests.filter((user) => user.UserId !== userId);
  }
  //This is of course only the connected guests
  public getAllGuests(): GuestUserAuth[] {
    return this.guests;
  }
  //write a main function that can run add member
}
// const userAuthRepo = new UserAuthRepo();
console.log("userAuthRepo");
// await userAuthRepo.addMember(MemberUserAuth.create("a@gmail.com","sasaswfdf"));
