import { TRPCError } from "@trpc/server";
import { type EditablePermission, Role } from "./Role";

export class OwnerRole extends Role {
  constructor() {
    super();
    this.roleType = "Owner";
    this.permissions.push("AddProduct");
    this.permissions.push("EditProductDetails");
    this.permissions.push("RemoveProduct");
    this.permissions.push("SeeStoreData");
    this.permissions.push("AppointStoreOwner");
    this.permissions.push("AppointStoreManager");
  }
  grantPermission(permission: EditablePermission): void {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to grant permissions to the owner",
    });
  }
  revokePermission(permission: EditablePermission): void {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to revoke permissions from the owner",
    });
  }
  canBeAppointedToStoreOwner(): boolean {
    return false;
  }
}
