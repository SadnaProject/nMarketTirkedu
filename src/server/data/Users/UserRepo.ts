import { Testable, testable } from "server/helpers/_Testable";
import { User } from "server/domain/Users/User";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";
import { inc, includes } from "ramda";

@testable
export class UserRepo extends Testable {
  private users: Map<string, User>;

  constructor() {
    super();
    this.users = new Map();
  }

  public async addUser(userId: string): Promise<void> {
    if (
      this.users.has(userId) ||
      (await getDB().user.findUnique({ where: { id: userId } })) !== null
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already exists",
      });
    }
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
  }

  public async getUser(id: string): Promise<User> {
    let user = this.users.get(id);
    if (user === undefined) {
      const userdb = await getDB().user.findUnique({
        where: { id: id },
        include: {
          notifications: true,
          cart: {
            include: {
              baskets: true,
            },
          },
        },
      });
      // console.log("db size: ",userdb?.cart?.baskets.length)
      if (userdb === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }
      user = await User.UserFromDTO(userdb);
      if (this.users.size < 10) this.users.set(id, user);
    }
    // console.log("size ", user.Cart.storeIdToBasket.size);
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
    if (this.users.has(id)) {
      this.users.delete(id);
    }
    if ((await getDB().user.findUnique({ where: { id: id } })) === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not found",
      });
    }
    await getDB().user.delete({ where: { id: id } });
  }

  async isUserExist(id: string): Promise<boolean> {
    return (await getDB().user.findUnique({ where: { id: id } })) !== null;
  }
}
