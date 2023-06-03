import { TRPCError } from "@trpc/server";
import { type EditablePermission, Role, RoleDTO } from "./Role";

export class OwnerRole extends Role {
  private static OwnerRole: OwnerRole;
  private constructor() {
    super();
    this.id = "Owner";
    this.roleType = "Owner";
    this.permissions.push("AddProduct");
    this.permissions.push("EditProductDetails");
    this.permissions.push("RemoveProduct");
    this.permissions.push("receivePrivateStoreData");
    this.permissions.push("AppointStoreOwner");
    this.permissions.push("AppointStoreManager");
    this.permissions.push("receiveClosedStoreData");
  }

  grantPermission(permission: EditablePermission): Promise<void> {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to grant permissions to the owner",
    });
    // return Promise.resolve();
  }
  revokePermission(permission: EditablePermission): Promise<void> {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to revoke permissions from the owner",
    });
  }
  canBeAppointedToStoreOwner(): boolean {
    return false;
  }
  static getOwnerRole(): OwnerRole {
    if (!OwnerRole.OwnerRole) OwnerRole.OwnerRole = new OwnerRole();
    return OwnerRole.OwnerRole;
  }
}
