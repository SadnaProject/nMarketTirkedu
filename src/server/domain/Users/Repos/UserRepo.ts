import { Testable, testable } from "server/domain/_Testable";
import { User } from "../User";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";

@testable
export class UserRepo extends Testable {
  private users: Map<string, User>;

  constructor() {
    super();
    this.users = new Map();
  }

  public addUser(userId: string): void {
    if (this.users.has(userId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already exists",
      });
    }
    this.users.set(userId, new User(userId));
  }

  public getUser(id: string): User {
    const user = this.users.get(id);
    if (user === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public removeUser(id: string): void {
    if (!this.users.has(id)) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    this.users.delete(id);
  }
  clone(userSource: string, userDest: string): void {
    const Dest = this.users.get(userDest);
    const Source = this.users.get(userSource);
    if (Dest === undefined || Source === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    Dest.clone(Source);
  }
  isUserExist(id: string): boolean {
    return this.users.has(id);
  }
  getUserByBidId(bidId: string): User {
    const user = this.getAllUsers().find((user) =>
      user.isBidExistFromMe(bidId)
    );
    if (user === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user;
  }
}
