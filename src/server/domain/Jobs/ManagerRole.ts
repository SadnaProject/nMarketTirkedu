import { TRPCError } from "@trpc/server";
import { Role, Permission, type EditablePermission } from "./Role";

export class ManagerRole extends Role {
  constructor() {
    super();
    this.permissions.push("SeeStoreData");
    this.roleType = "Manager";
  }
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
