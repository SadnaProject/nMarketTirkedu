import { TRPCError } from "@trpc/server";
import { JobsController } from "./JobsController";
import { ManagerRole } from "./ManagerRole";
import { RoleDTO, type EditablePermission, Role } from "./Role";
import { db } from "server/db";
import { RoleType } from "@prisma/client";

export type PositionHolderDTO = {
  role: RoleDTO;
  storeId: string;
  userId: string;
  assignedPositionHolders: PositionHolderDTO[];
};
export class PositionHolder {
  private role: Role;
  private storeId: string;
  private userId: string; //this user is a member for sure
  private appointments: PositionHolder[];
  // private dto: PositionHolderDTO | undefined;

  constructor(role: Role, storeId: string, userId: string) {
    this.role = role;
    this.storeId = storeId;
    this.userId = userId;
    this.appointments = [];
    // this.dto = undefined;
  }
  // static createPositionHolderForManager( storeId: string, userId: string): PositionHolder {
  //   return new PositionHolder(JobsController.managerRole, storeId, userId);
  // }
  public static createPositionHolderFromDTO(
    dto: PositionHolderDTO
  ): PositionHolder {
    const positionHolder = new PositionHolder(
      Role.createRoleFromDTO(dto.role),
      dto.storeId,
      dto.userId
    );
    positionHolder.appointments = dto.assignedPositionHolders.map(
      (positionHolderDTO) => this.createPositionHolderFromDTO(positionHolderDTO)
    );
    // positionHolder.dto = dto;
    return positionHolder;
  }
  public get DTO(): PositionHolderDTO {
    // if (this.dto !== undefined)
    // {
    //     return this.dto;
    // }
    return {
      role: this.role.DTO,
      storeId: this.storeId,
      userId: this.userId,
      assignedPositionHolders: this.appointments.map(
        (positionHolder) => positionHolder.DTO
      ),
    };
  }

  private async addPositionHolder(
    positionHolder: PositionHolder
  ): Promise<void> {
    // this.appointments.push(positionHolder);
    await db.positionHolder.create({
      data: {
        storeId: positionHolder.storeId,
        userId: positionHolder.userId,
        // role: { connect: { id: positionHolder.role.getRoleType() } },
        roleId: positionHolder.role.getRoleType(),
        assignerId: this.userId,
        // assignedBy: { connect: { userId: this.userId,storeId: this.storeId } },
      },
    });
  }
  public async appointStoreOwner(userId: string): Promise<void> {
    if (!this.role.hasPermission("AppointStoreOwner")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User does not have permission to appoint store owner for store with id: " +
          this.storeId,
      });
    }
    // await this.addPositionHolder(
    //   new PositionHolder(JobsController.ownerRole, this.storeId, userId)
    // );
    const positionHolder = new PositionHolder(
      JobsController.ownerRole,
      this.storeId,
      userId
    );
    //TODO: find a more elegant way to do this(in founder also)
    if (
      (await db.role.findMany({ where: { roleType: RoleType.Owner } }))
        .length == 0
    ) {
      console.log("creating owner role");
      await db.role.create({
        data: {
          id: RoleType.Owner,
          roleType: positionHolder.role.getRoleType(),
          permissions: positionHolder.role.getPermissions(),
        },
      });
    }
    await db.positionHolder.create({
      data: {
        storeId: positionHolder.storeId,
        userId: positionHolder.userId,
        // role: { connect: { id: positionHolder.role.getRoleType() } },
        roleId: positionHolder.role.getRoleType(),

        assignerId: this.userId,
        // assignedBy: { connect: { userId: this.userId,storeId: this.storeId } },
      },
    });

    // const storeOwner = new PositionHolder(new StoreOwnerRole(), this.storeId, userId);
  }
  public async appointStoreManager(userId: string): Promise<void> {
    if (!this.role.hasPermission("AppointStoreManager")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User does not have permission to appoint store manager for store with id: " +
          this.storeId,
      });
    }

    // await this.addPositionHolder(
    //   new PositionHolder(new ManagerRole(), this.storeId, userId)
    // );
    const positionHolder = new PositionHolder(
      new ManagerRole(),
      this.storeId,
      userId
    );
    const role = await db.role.create({
      data: {
        roleType: positionHolder.Role.getRoleType(),
        permissions: positionHolder.Role.getPermissions(),
      },
    });
    await db.positionHolder.create({
      data: {
        storeId: positionHolder.storeId,
        userId: positionHolder.userId,
        // role: { connect: { id: positionHolder.role.getRoleType() } },
        assignerId: this.userId,
        // role: { create: { roleType: RoleType.Manager } },
        roleId: role.id,
        // assignedBy: { connect: { userId: this.userId,storeId: this.storeId } },
      },
    });
  }

  public removeAppointee(userId: string): void {
    const index = this.appointments.findIndex(
      (positionHolder) => positionHolder.UserId === userId
    );
    if (index === -1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not appointed by this position holder for store with id: " +
          this.storeId,
      });
    }
    this.appointments.splice(index, 1);
  }
  public setAppointeePermission(
    targetUserId: string,
    permissionStatus: boolean,
    permission: EditablePermission
  ): void {
    const appointee = this.appointments.find(
      (positionHolder) => positionHolder.UserId === targetUserId
    );
    if (appointee === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not appointed by this position holder for store with id: " +
          this.storeId,
      });
    }
    if (permissionStatus) {
      appointee.Role.grantPermission(permission);
    } else {
      appointee.Role.revokePermission(permission);
    }
  }

  public set Role(role: Role) {
    this.role = role;
    // if (this.dto !== undefined) {
    //     this.dto.role = role;
    // }
  }
  public get Role(): Role {
    return this.role;
  }
  public get StoreId(): string {
    return this.storeId;
  }
  public get UserId(): string {
    return this.userId;
  }
  public get Appointments(): PositionHolder[] {
    return this.appointments;
  }
}
