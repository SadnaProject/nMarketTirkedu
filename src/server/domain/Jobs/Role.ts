import { z } from "zod";

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
export const roleTypeSchema = z.enum(["Owner", "Manager", "Founder"]);
export type RoleType = z.infer<typeof roleTypeSchema>;

export type RoleDTO = {
  id: string;
  permissions: Permission[];
  roleType: RoleType;
};
export abstract class Role {
  protected permissions: Permission[];
  protected roleType: RoleType;
  protected id: string;
  constructor() {
    this.permissions = [];
    this.roleType = "Manager";
    this.id = "";
  }
  // static createRoleFromDTO(dto: RoleDTO, given: Role): Role {
  //   // let role: Role;
  //   // if (dto.roleType === "Owner") role = Owner;
  //   // else if (dto.roleType === "Founder") role = JobsController.founderRole;
  //   // else role = JobsController.founderRole; //TODO this needs to be changed to manager role
  //   // //i dont how to do this
  //   // role.permissions = dto.permissions;
  //   // role.roleType = dto.roleType;
  //   // return role;
  // }
  public get DTO(): RoleDTO {
    return {
      id: this.id,
      permissions: this.permissions,
      roleType: this.roleType,
    };
  }
  public get ID(): string {
    return this.id;
  }
  public setPermissions(permissions: Permission[]): void {
    this.permissions = permissions;
  }
  public getRoleType(): RoleType {
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
  abstract grantPermission(permission: EditablePermission): Promise<void>;
  abstract revokePermission(permission: EditablePermission): Promise<void>;
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }
  abstract canBeAppointedToStoreOwner(): boolean;
  public getPermissions(): Permission[] {
    return this.permissions;
  }
}
