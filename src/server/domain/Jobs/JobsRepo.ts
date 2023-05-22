import { Testable, testable } from "server/domain/_Testable";
import { PositionHolder } from "./PositionHolder";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
import { RoleType } from "@prisma/client";

@testable
export class JobsRepo extends Testable {
  private storeIdToFounder = new Map<string, PositionHolder>();
  private systemAdminIds: string[];
  constructor() {
    super();
    this.systemAdminIds = [];
  }
  public async getAllStoreIds(): Promise<string[]> {
    const allStoreIds = (
      await db.positionHolder.findMany({ select: { storeId: true } })
    ).map((ph) => ph.storeId);
    return [...new Set(allStoreIds)];
  }
  public async addSystemAdmin(userId: string): Promise<void> {
    this.systemAdminIds.push(userId);
    await db.admin.create({ data: { userId: userId } });
  }
  public async removeSystemAdmin(userId: string): Promise<void> {
    await db.admin.delete({ where: { userId: userId } });
    this.systemAdminIds = this.systemAdminIds.filter((id) => id !== userId);
  }
  public async getSystemAdmins(): Promise<string[]> {
    // return this.systemAdminIds;
    return (await db.admin.findMany({ select: { userId: true } })).map(
      (admin) => admin.userId
    );
  }

  public async SetStoreFounder(founder: PositionHolder): Promise<void> {
    //todo: delete the row below
    // this.storeIdToFounder.set(founder.StoreId, founder);
    //todo: there needs to only one founder role in the db
    if (
      (await db.role.findMany({ where: { roleType: RoleType.Founder } }))
        .length == 0
    ) {
      console.log("creating founder role");
      await db.role.create({
        data: {
          //TODO change this to just use founderRole
          id: RoleType.Founder,
          roleType: founder.Role.getRoleType(),
          permissions: founder.Role.getPermissions(),
        },
      });
    }
    await db.positionHolder.create({
      data: {
        storeId: founder.StoreId,
        userId: founder.UserId,
        roleId: RoleType.Founder,
      },
    });
  }

  // public async GetStoreFounder(storeId: string): Promise<PositionHolder> {
  //   //un some db query just for the sake of it for using await
  //   const dbPositionHolder = await db.positionHolder.findFirst({ where: {} });
  //   const founder = this.storeIdToFounder.get(storeId);
  //   if (founder === undefined) {
  //     throw new TRPCError({
  //       code: "BAD_REQUEST",
  //       message:
  //         "store founder not found for store with id: " +
  //         storeId +
  //         " not found",
  //     });
  //   }
  //   return founder;
  // }
  public async GetStoreFounder(storeId: string): Promise<PositionHolder> {
    const founder = this.storeIdToFounder.get(storeId);
    if (founder === undefined) {
      const dbPositionHolder = await db.positionHolder.findFirst({
        include: { role: true, assignedPositionHolders: true },
        where: {
          storeId: storeId,
          roleId: RoleType.Founder,
        },
      });
      if (dbPositionHolder === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "store founder not found for store with id: " +
            storeId +
            " not found",
        });
      }
      const founder = await this.getPositionHolderFromDB(
        dbPositionHolder.storeId,
        dbPositionHolder.userId
      );
      return founder;
    }
    return founder;
  }
  /**
   * Returns the whole position holder tree
   */
  private async getPositionHolderFromDB(
    storeId: string,
    userId: string
  ): Promise<PositionHolder> {
    const dbPositionHolder = await db.positionHolder.findUnique({
      where: { userId_storeId: { storeId: storeId, userId: userId } },
      include: { role: true, assignedPositionHolders: true },
    });
    if (dbPositionHolder === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "position holder with userId: " +
          userId +
          " not found in store: " +
          storeId,
      });
    } else {
      if (dbPositionHolder.assignedPositionHolders.length == 0) {
        return PositionHolder.createPositionHolderFromDTO({
          role: dbPositionHolder.role,
          storeId: dbPositionHolder.storeId,
          userId: dbPositionHolder.userId,
          assignedPositionHolders: [],
        });
      } else {
        const assignedPositionHolders = await Promise.all(
          dbPositionHolder.assignedPositionHolders.map(
            async (positionHolder) => {
              return await this.getPositionHolderFromDB(
                positionHolder.storeId,
                positionHolder.userId
              );
            }
          )
        );
        return PositionHolder.createPositionHolderFromDTO({
          role: dbPositionHolder.role,
          storeId: dbPositionHolder.storeId,
          userId: dbPositionHolder.userId,
          assignedPositionHolders: assignedPositionHolders.map(
            (positionHolder) => {
              return positionHolder.DTO;
            }
          ),
        });
      }
    }
  }
  public async getPositionHolderByUserIdAndStoreId(
    userId: string,
    storeId: string
  ): Promise<PositionHolder | undefined> {
    //this will work, but it is not efficient
    // const founder = await this.GetStoreFounder(storeId);
    // const positionHolder = this.findPositionHolder(userId, founder);
    // return positionHolder;
    //TODO the following code is more efficient,  - check if it works
    try {
      return await this.getPositionHolderFromDB(storeId, userId);
    } catch (error) {
      return undefined;
    }
    // return await this.getPositionHolderFromDB(storeId, userId);
  }
  private findPositionHolder(
    userId: string,
    positionHolder: PositionHolder
  ): PositionHolder | undefined {
    if (positionHolder.UserId === userId) {
      return positionHolder;
    }
    for (const appointedByMe of positionHolder.Appointments) {
      const found = this.findPositionHolder(userId, appointedByMe);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }
  public async getAllPositionHoldersByStoreId(
    storeId: string
  ): Promise<PositionHolder[]> {
    const founder = await this.GetStoreFounder(storeId);
    return this.getAllPositionHolders(founder);
  }
  private getAllPositionHolders(
    positionHolder: PositionHolder
  ): PositionHolder[] {
    const positionHolders = [positionHolder];
    for (const appointedByMe of positionHolder.Appointments) {
      positionHolders.push(...this.getAllPositionHolders(appointedByMe));
    }
    return positionHolders;
  }
  // public getAllPositionHoldersHierarchyByStoreId(storeId: string): PositionHolder[] {
  //   const founder = this.GetStoreFounder(storeId);
  //   return this.getAllPositionHoldersHierarchy(founder);
  // }
  // private getAllPositionHoldersHierarchy( positionHolder: PositionHolder): PositionHolder[] {
  //   const positionHolders = [positionHolder];
  //   for (const appointedByMe of positionHolder.Appointments) {
  //     positionHolders.push(...this.getAllPositionHoldersHierarchy(appointedByMe));
  //   }
  //   return positionHolders;
  // }
}
