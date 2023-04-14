import { Role } from "./Role";

export class PositionHolder{
    private role: Role;
    private storeId: string;
    private userId: string;//this user is a member for sure 

    constructor(role: Role, storeId: string, userId: string){
        this.role = role;
        this.storeId = storeId;
        this.userId = userId;
    }

    canCreateProductInStore(): boolean {
        return this.role.canCreateProductInStore();
    }
}