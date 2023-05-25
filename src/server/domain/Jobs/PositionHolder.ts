import { TRPCError } from "@trpc/server";
import { getDB } from "server/domain/_Transactional";
import { RoleType } from "@prisma/client";
import { RoleDTO, type EditablePermission, Role } from "./Role";
import { OwnerRole } from "./OwnerRole";
import { FounderRole } from "./FounderRole";
import { ManagerRole } from "./ManagerRole";

export type PositionHolderDTO = {
  role: RoleDTO;
  storeId: string;
  userId: string;
  email?: string;
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
    let role: Role;
    if (dto.role.roleType === RoleType.Owner) {
      role = OwnerRole.getOwnerRole();
    } else if (dto.role.roleType === RoleType.Founder) {
      role = FounderRole.getFounderRole();
    } else {
      //TODO create all these roles using "createRoleFromDTO"(be careful with the imports, we might need to move RoleDto an another file)
      role = ManagerRole.createManagerRoleFromDTO(dto.role);
    }

    const positionHolder = new PositionHolder(role, dto.storeId, dto.userId);
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
    await getDB().positionHolder.create({
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
      OwnerRole.getOwnerRole(),
      this.storeId,
      userId
    );
    //TODO: find a more elegant way to do this(in founder also)
    if (
      (await getDB().role.findMany({ where: { roleType: RoleType.Owner } }))
        .length == 0
    ) {
      console.log("creating owner role");
      await getDB().role.create({
        data: {
          id: RoleType.Owner,
          roleType: positionHolder.role.getRoleType(),
          permissions: positionHolder.role.getPermissions(),
        },
      });
    }
    await getDB().positionHolder.create({
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
    const managerRole = new ManagerRole();
    const positionHolder = new PositionHolder(
      managerRole,
      this.storeId,
      userId
    );
    const role = await getDB().role.create({
      data: {
        id: managerRole.ID,
        roleType: positionHolder.Role.getRoleType(),
        permissions: positionHolder.Role.getPermissions(),
      },
    });
    await getDB().positionHolder.create({
      data: {
        storeId: positionHolder.storeId,
        userId: positionHolder.userId,
        // role: { connect: { id: positionHolder.role.getRoleType() } },
        assignerId: this.userId,
        // role: { create: { roleType: RoleType.Manager } },
        roleId: managerRole.ID,
        // assignedBy: { connect: { userId: this.userId,storeId: this.storeId } },
      },
    });
    this.appointments.push(positionHolder);
  }

  public async removeAppointee(userId: string): Promise<void> {
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
    await getDB().positionHolder.delete({
      where: { userId_storeId: { userId: userId, storeId: this.storeId } },
    });
    this.appointments.splice(index, 1);
  }
  public async setAppointeePermission(
    targetUserId: string,
    permissionStatus: boolean,
    permission: EditablePermission
  ): Promise<void> {
    const appointee = this.appointments.find(
      (positionHolder) => positionHolder.UserId === targetUserId
    );
    if (appointee === undefined) {
      //TODO search in db for a second chance
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not appointed by this position holder for store with id: " +
          this.storeId,
      });
    }
    if (permissionStatus) {
      await appointee.Role.grantPermission(permission);
    } else {
      await appointee.Role.revokePermission(permission);
    }
  }

  // public set Role(role: Role) {
  //   this.role = role;
  //   // if (this.dto !== undefined) {
  //   //     this.dto.role = role;
  //   // }
  // }
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
