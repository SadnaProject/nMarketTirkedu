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
export abstract class Role {
  protected permissions: Permission[];
  protected roleType?: RoleType;
  constructor() {
    this.permissions = [];
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
