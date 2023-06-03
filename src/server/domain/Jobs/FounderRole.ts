import { TRPCError } from "@trpc/server";
import { type EditablePermission, Role } from "./Role";

export class FounderRole extends Role {
  //TODO maybe its better to extend OwnerRole
  private static founderRole: FounderRole;
  private constructor() {
    super();
    this.id = "Founder";
    this.roleType = "Founder";
    this.permissions.push("DeactivateStore");
    this.permissions.push("ActivateStore");
    this.permissions.push("AddProduct");
    this.permissions.push("EditProductDetails");
    this.permissions.push("RemoveProduct");
    this.permissions.push("receivePrivateStoreData");
    this.permissions.push("AppointStoreOwner");
    this.permissions.push("AppointStoreManager");
    this.permissions.push("receiveClosedStoreData");
  }
  // private static async createFounderRole(): Promise<FounderRole> {
  //   const founderRole = new FounderRole();
  //   await db.role.create({
  //     data: { id: RoleType.Founder, roleType: RoleType.Founder },
  //   });
  //   return founderRole;
  // }
  grantPermission(permission: EditablePermission): Promise<void> {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to grant permissions to the founder",
    });
  }
  revokePermission(permission: EditablePermission): Promise<void> {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are not allowed to revoke permissions from the founder",
    });
  }
  canBeAppointedToStoreOwner(): boolean {
    return false;
  }
  static getFounderRole(): FounderRole {
    if (!this.founderRole) this.founderRole = new FounderRole();
    return this.founderRole;
  }
}
