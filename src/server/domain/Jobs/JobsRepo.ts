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
  public getAllStoreIds(): string[] {
    return Array.from(this.storeIdToFounder.keys());
  }
  public addSystemAdmin(userId: string): void {
    this.systemAdminIds.push(userId);
  }
  public removeSystemAdmin(userId: string): void {
    this.systemAdminIds = this.systemAdminIds.filter((id) => id !== userId);
  }
  public getSystemAdmins(): string[] {
    return this.systemAdminIds;
  }

  public async SetStoreFounder(founder: PositionHolder): Promise<void> {
    // this.storeIdToFounder.set(founder.StoreId, founder);
    //todo: there needs to only one founder role in the db
    if (
      (await db.role.findMany({ where: { roleType: RoleType.Founder } }))
        .length == 0
    ) {
      console.log("creating founder role");
      await db.role.create({
        data: {
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
    const founder = await this.GetStoreFounder(storeId);
    const positionHolder = this.findPositionHolder(userId, founder);
    return positionHolder;
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
}
