import { EditablePermission, Role } from "./Role";

export class OwnerRole extends Role{
    constructor(){
        super();
        this.permissions.push("AddProduct");
        this.permissions.push("EditProductDetails");
        this.permissions.push("RemoveProduct");
        this.permissions.push("SeeStoreData");
    }
    grantPermission(permission: EditablePermission): void {
        throw new Error("You are not allowed to grant permissions to the owner");
    }
    revokePermission(permission: EditablePermission): void {
        throw new Error("You are not allowed to revoke permissions from the owner");
    }

}