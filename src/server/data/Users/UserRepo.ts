import { Testable, testable } from "server/helpers/_Testable";
import { User } from "server/domain/Users/User";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";

@testable
export class UserRepo extends Testable {
  private users: Map<string, User>;

  constructor() {
    super();
    this.users = new Map();
  }

  public async addUser(userId: string): Promise<void> {
    /*if (this.users.has(userId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already exists",
      });
    }*/
    // const user = await db.user.findUnique({ where: { id: userId } });
    // if (user) {
    //   throw new TRPCError({
    //     code: "BAD_REQUEST",
    //     message: "User already exists",
    //   });
    // }
    try {
      await getDB().user.create({
        data: {
          id: userId,
        },
      });

      await getDB().cart.create({
        data: {
          userId: userId,
        },
      });
      if (this.users.size < 10) this.users.set(userId, new User(userId));
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already exists",
        cause: e,
      });
    }
  }

  public async getUser(id: string): Promise<User> {
    let user = this.users.get(id);
    if (user === undefined) {
      const userdb = await getDB().user.findUnique({ where: { id: id } });
      if (userdb === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }
      user = await User.UserFromDTO(userdb);
      if (this.users.size < 10) this.users.set(id, user);
    }
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    // return Array.from(this.users.values());
    const members = await getDB().user.findMany();
    const ans = [];
    for (const m of members) {
      ans.push(await User.UserFromDTO(m));
    }
    return ans;
  }

  public async removeUser(id: string): Promise<void> {
    if (!this.users.has(id)) {
      /*throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });*/
      const user = await getDB().user.findUnique({ where: { id: id } });
      if (user === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not exist",
        });
      }
    }
    await getDB().user.delete({ where: { id: id } });
    this.users.delete(id);
  }
  async clone(userSource: string, userDest: string): Promise<void> {
    let Dest = this.users.get(userDest);
    let Source = this.users.get(userSource);
    if (Dest === undefined || Source === undefined) {
      const s = await getDB().user.findUnique({ where: { id: userSource } });
      const d = await getDB().user.findUnique({ where: { id: userDest } });
      if (s === null || d === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      if (Dest === undefined) {
        Dest = await User.UserFromDTO(d);
      }
      if (Source === undefined) {
        Source = await User.UserFromDTO(s);
      }
    }
    await Dest.clone(Source);
  }
  async isUserExist(id: string): Promise<boolean> {
    return (await getDB().user.findUnique({ where: { id: id } })) !== null;
  }
  async getUserByBidId(bidId: string): Promise<User> {
    const user = (await this.getAllUsers()).find((user) =>
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
