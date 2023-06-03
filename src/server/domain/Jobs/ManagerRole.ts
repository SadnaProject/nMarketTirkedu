import { TRPCError } from "@trpc/server";
import { Role, type EditablePermission, type RoleDTO } from "./Role";
import { getDB } from "server/helpers/_Transactional";
import { randomUUID } from "crypto";

export class ManagerRole extends Role {
  constructor() {
    super();
    //set id to be some unique value
    this.id = randomUUID();
    this.permissions.push("receivePrivateStoreData");
    this.roleType = "Manager";
  }
  // public static async createManagerRole(
  //   managerId: string,
  //   storeId: string
  // ): Promise<ManagerRole> {
  //   const managerRole = new ManagerRole();
  //   const id =await db.role.create({
  //     data: { roleType: RoleType.Manager },
  //   });

  //   return managerRole;
  // }
  public static createManagerRoleFromDTO(roleDTO: RoleDTO): ManagerRole {
    const managerRole = new ManagerRole();
    managerRole.permissions = roleDTO.permissions;
    managerRole.roleType = roleDTO.roleType;
    managerRole.id = roleDTO.id;
    return managerRole;
  }
  async grantPermission(permission: EditablePermission): Promise<void> {
    if (this.hasPermission(permission))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The role already has this permission",
      });
    else {
      // console.log(this.ID);
      await getDB().role.update({
        where: { id: this.id },
        data: { permissions: { push: permission } },
      });

      this.permissions.push(permission);
    }
  }
  async revokePermission(permission: EditablePermission): Promise<void> {
    if (!this.hasPermission(permission))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The role does not have this permission",
      });
    else {
      // const index = this.permissions.indexOf(permission);
      const updatedPermissions = this.permissions.filter(
        (p) => p !== permission
      );
      //delete permission from roles permissions
      await getDB().role.update({
        where: { id: this.id },
        data: { permissions: updatedPermissions },
      });
      this.permissions = updatedPermissions;
      // this.permissions.splice(index, 1);
    }
  }
  canBeAppointedToStoreOwner(): boolean {
    return true;
  }
  canAppointStoreOwner(): boolean {
    return false;
  }
  canAppointStoreManager(): boolean {
    return false;
  }
}
