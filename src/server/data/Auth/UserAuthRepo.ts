import { Testable, testable } from "server/helpers/_Testable";
import { MemberUserAuth } from "../../domain/Auth/MemberUserAuth";
import type { GuestUserAuth } from "../../domain/Auth/GuestUserAuth";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";

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
    // this.members.push(user);
    //add to db
    // console.log("password: " + user.Password);
    await getDB().userAuth.create({
      data: {
        id: user.UserId,
        email: user.Email,
        password: user.Password,
      },
    });
  }
  public async getMemberByEmail(email: string): Promise<MemberUserAuth> {
    const user = this.members.find((user) => user.Email === email);
    if (user === undefined) {
      //look in db
      const user = await getDB().userAuth.findUnique({
        where: { email: email },
      });
      if (user === null)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user with email: " + email + " not found",
        });
      else return MemberUserAuth.createFromDTO(user);
    }
    return user;
  }

  public async getMemberById(userId: string): Promise<MemberUserAuth> {
    const user = this.members.find((user) => user.UserId === userId);
    if (user) {
      return user;
    }
    //look in db
    const dbUser = await getDB().userAuth.findUnique({ where: { id: userId } });
    if (dbUser) {
      return MemberUserAuth.createFromDTO(dbUser);
    }
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "user with id: " + userId + " not found",
    });
  }
  public async doesMemberExistByEmail(email: string): Promise<boolean> {
    if (this.members.some((user) => user.Email === email)) return true;
    //search in db
    else {
      const user = await getDB().userAuth.findUnique({
        where: { email: email },
      });
      if (user === null) return false;
      else return true;
    }
  }
  public async doesMemberExistById(userId: string): Promise<boolean> {
    if (this.members.some((user) => user.UserId === userId)) return true;
    //search in db
    else {
      const user = await getDB().userAuth.findUnique({ where: { id: userId } });
      if (user === null) return false;
      else return true;
    }
  }

  public async removeMember(userId: string): Promise<void> {
    if (!(await this.doesMemberExistById(userId)))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user with id: " + userId + " not found",
      });
    //remove from db
    await getDB().userAuth.delete({ where: { id: userId } });
    this.members = this.members.filter((user) => user.UserId !== userId);
  }
  public async getAllMembers(): Promise<MemberUserAuth[]> {
    //get from db
    const members = await getDB().userAuth.findMany();
    return members.map((member) => MemberUserAuth.createFromDTO(member));
  }
  public async getAllMemberEmails(): Promise<string[]> {
    //get from db
    const members = await getDB().userAuth.findMany();
    return members.map((member) => member.email);
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
}
