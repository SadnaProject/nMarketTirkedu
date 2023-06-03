import { Testable, testable } from "server/helpers/_Testable";
import { PositionHolder } from "../../domain/Jobs/PositionHolder";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";
import { RoleType } from "@prisma/client";

@testable
export class JobsRepo extends Testable {
  private storeIdToFounder = new Map<string, PositionHolder>();
  private cacheQueue: string[];
  private systemAdminIds: string[];
  constructor() {
    super();
    this.systemAdminIds = [];
    this.cacheQueue = [];
  }
  private addToCache(storeId: string, positionHolder: PositionHolder) {
    const cacheSize = 10;
    const index = this.cacheQueue.findIndex((storeId) => storeId === storeId);
    if (index !== -1) {
      // If the user is already in the cache, move it to the end of the queue
      this.cacheQueue.splice(index, 1);
    } else if (this.cacheQueue.length >= cacheSize) {
      // If the cache is full, remove the oldest user from the queue
      const storeIdToRemove = this.cacheQueue.shift();
      this.storeIdToFounder.delete(storeIdToRemove!);
    }
    if (this.storeIdToFounder.get(storeId) === undefined) {
      this.storeIdToFounder.set(storeId, positionHolder);
    }
    // Add the user to the end of the queue
    this.cacheQueue.push(storeId);
  }
  private removeFromCache(storeId: string) {
    const index = this.cacheQueue.findIndex((storeId) => storeId === storeId);
    if (index !== -1) {
      this.cacheQueue.splice(index, 1);
    }
    this.storeIdToFounder.delete(storeId);
  }
  public async getAllStoreIds(): Promise<string[]> {
    const allStoreIds = (
      await getDB().positionHolder.findMany({ select: { storeId: true } })
    ).map((ph) => ph.storeId);
    return [...new Set(allStoreIds)];
  }
  public async addSystemAdmin(userId: string): Promise<void> {
    this.systemAdminIds.push(userId);
    await getDB().admin.create({ data: { userId: userId } });
  }
  public async removeSystemAdmin(userId: string): Promise<void> {
    await getDB().admin.delete({ where: { userId: userId } });
    this.systemAdminIds = this.systemAdminIds.filter((id) => id !== userId);
  }
  public async getSystemAdmins(): Promise<string[]> {
    // return this.systemAdminIds;
    return (await getDB().admin.findMany({ select: { userId: true } })).map(
      (admin) => admin.userId
    );
  }

  public async SetStoreFounder(founder: PositionHolder): Promise<void> {
    //todo: there needs to only one founder role in the db
    if (
      (await getDB().role.findMany({ where: { roleType: RoleType.Founder } }))
        .length == 0
    ) {
      // console.log("creating founder role");
      await getDB().role.create({
        data: {
          //TODO change this to just use founderRole
          id: RoleType.Founder,
          roleType: founder.Role.getRoleType(),
          permissions: founder.Role.getPermissions(),
        },
      });
    }
    await getDB().positionHolder.create({
      data: {
        storeId: founder.StoreId,
        userId: founder.UserId,
        roleId: RoleType.Founder,
      },
    });
    this.addToCache(founder.StoreId, founder);
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
      const dbPositionHolder = await getDB().positionHolder.findFirst({
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
      this.addToCache(founder.StoreId, founder);
      return founder;
    }
    return founder;
  }
  /**
   * Returns the whole position holder tree.
   * @param storeId
   * @param userId
   */
  private async getPositionHolderFromDB(
    storeId: string,
    userId: string
  ): Promise<PositionHolder> {
    const dbPositionHolder = await getDB().positionHolder.findUnique({
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
      // console.log(error);
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
