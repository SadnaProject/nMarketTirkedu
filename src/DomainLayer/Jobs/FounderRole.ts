import { EditablePermission, Role } from "./Role";

export class FounderRole extends Role//TODO maybe its better to extend OwnerRole
{
    constructor() {
        super();
        this.permissions.push("DeactivateStore");
        this.permissions.push("ActivateStore");
        this.permissions.push("AddProduct");
        this.permissions.push("EditProductDetails");
        this.permissions.push("RemoveProduct");
        this.permissions.push("SeeStoreData");
    }
    grantPermission(permission: EditablePermission): void {
        throw new Error("You are not allowed to grant permissions to the founder");
    }
    revokePermission(permission: EditablePermission): void {
        throw new Error("You are not allowed to revoke permissions from the founder");
    }

    
    
}