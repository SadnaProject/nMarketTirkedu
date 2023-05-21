import { TRPCError } from "@trpc/server";
import { Role, Permission, type EditablePermission } from "./Role";
import { db } from "server/db";
import { RoleType } from "@prisma/client";

export class ManagerRole extends Role {
  constructor() {
    super();
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
  grantPermission(permission: EditablePermission): void {
    if (this.hasPermission(permission))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The role already has this permission",
      });
    else this.permissions.push(permission);
  }
  revokePermission(permission: EditablePermission): void {
    if (!this.hasPermission(permission))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The role does not have this permission",
      });
    else {
      const index = this.permissions.indexOf(permission);
      this.permissions.splice(index, 1);
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
