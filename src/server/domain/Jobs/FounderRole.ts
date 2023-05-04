import { TRPCError } from "@trpc/server";
import { type EditablePermission, Role } from "./Role";

export class FounderRole extends Role {
  //TODO maybe its better to extend OwnerRole
  constructor() {
    super();
    this.roleType = "Founder";
    this.permissions.push("DeactivateStore");
    this.permissions.push("ActivateStore");
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
      message: "You are not allowed to grant permissions to the founder",
    });
  }
  revokePermission(permission: EditablePermission): void {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to revoke permissions from the founder",
    });
  }
  canBeAppointedToStoreOwner(): boolean {
    return false;
  }
}
