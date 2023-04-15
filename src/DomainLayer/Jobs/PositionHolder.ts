import { Role } from "./Role";

export type PositionHolderDTO = {
    role: Role;
    storeId: string;
    userId: string;
    appointedByMe: PositionHolderDTO[];
}
export class PositionHolder{
    private role: Role;
    private storeId: string;
    private userId: string;//this user is a member for sure
    private appointedByMe: PositionHolder[]

    constructor(role: Role, storeId: string, userId: string){
        this.role = role;
        this.storeId = storeId;
        this.userId = userId;
        this.appointedByMe = [];
    }
    public get DTO(): PositionHolderDTO {
        return {
            role: this.role,
            storeId: this.storeId,
            userId: this.userId,
            appointedByMe: this.appointedByMe.map((positionHolder) => positionHolder.DTO),
        };
    }
    canCreateProductInStore(): boolean {
        return this.role.canCreateProductInStore();
    }

}