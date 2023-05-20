export type Permission =
  | "DeactivateStore"
  | "ActivateStore"
  | EditablePermission
  | "AppointStoreOwner"
  | "AppointStoreManager"
  | "receiveClosedStoreData";
export type EditablePermission =
  | "AddProduct"
  | "EditProductDetails"
  | "RemoveProduct"
  | "receivePrivateStoreData";
export type RoleType = "Owner" | "Manager" | "Founder";

// import { type RoleType } from "@prisma/client";
import { JobsController } from "./JobsController";
// import { ManagerRole } from "./ManagerRole";
export type RoleDTO = {
  permissions: Permission[];
  roleType?: RoleType;
};
export abstract class Role {
  protected permissions: Permission[];
  protected roleType?: RoleType;
  constructor() {
    this.permissions = [];
  }
  public static createRoleFromDTO(dto: RoleDTO): Role {
    let role: Role;
    if (dto.roleType === "Owner") role = JobsController.ownerRole;
    else if (dto.roleType === "Founder") role = JobsController.founderRole;
    else role = JobsController.founderRole; //TODO this needs to be changed to manager role
    //i dont how to do this
    role.permissions = dto.permissions;
    role.roleType = dto.roleType;
    return role;
  }
  public get DTO(): RoleDTO {
    return {
      permissions: this.permissions,
      roleType: this.roleType,
    };
  }
  public getRoleType(): RoleType | undefined {
    return this.roleType;
  }

  public isStoreOwner(): boolean {
    return this.roleType === "Owner";
  }
  public isStoreManager(): boolean {
    return this.roleType === "Manager";
  }
  public isStoreFounder(): boolean {
    return this.roleType === "Founder";
  }
  abstract grantPermission(permission: EditablePermission): void;
  abstract revokePermission(permission: EditablePermission): void;
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }
  abstract canBeAppointedToStoreOwner(): boolean;
}
