import { Role,Permission,EditablePermission } from "./Role";

export class ManagerRole extends Role{
    constructor(){
        super();
        this.permissions.push("SeeStoreData");
    }
    grantPermission(permission: EditablePermission): void {
        if(this.hasPermission(permission))
            throw new Error("The role already has this permission");
        else
            this.permissions.push(permission);
    }
    revokePermission(permission: EditablePermission): void {
        if(!this.hasPermission(permission))
            throw new Error("The role doesn't have this permission");
        else{
            const index = this.permissions.indexOf(permission);
            this.permissions.splice(index,1);
        }
    }
    


   

}