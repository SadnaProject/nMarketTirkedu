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
    // private dto: PositionHolderDTO | undefined;

    constructor(role: Role, storeId: string, userId: string){
        this.role = role;
        this.storeId = storeId;
        this.userId = userId;
        this.appointedByMe = [];
        // this.dto = undefined;
    }
    public static createPositionHolderFromDTO(dto: PositionHolderDTO): PositionHolder {
        const positionHolder = new PositionHolder(dto.role, dto.storeId, dto.userId);
        positionHolder.appointedByMe = dto.appointedByMe.map((positionHolderDTO) => this.createPositionHolderFromDTO(positionHolderDTO));
        // positionHolder.dto = dto;
        return positionHolder;
    }
    public get DTO(): PositionHolderDTO {
        // if (this.dto !== undefined) 
        // { 
        //     return this.dto;
        // }  
        return {
            role: this.role,
            storeId: this.storeId,
            userId: this.userId,
            appointedByMe: this.appointedByMe.map((positionHolder) => positionHolder.DTO),
        };
    }
    public appointPositionHolder(positionHolder: PositionHolder): void {
        this.appointedByMe.push(positionHolder);
        // if (this.dto !== undefined) {
        //     this.dto.appointedByMe.push(positionHolder.DTO);
        // }
    }
    public set Role(role: Role) {
        this.role = role;
        // if (this.dto !== undefined) {
        //     this.dto.role = role;
        // }
    }
    public get Role(): Role {
        return this.role;
    }
    public get StoreId(): string {
        return this.storeId;
    }
    public get UserId(): string {
        return this.userId;
    }
    public get AppointedByMe(): PositionHolder[] {
        return this.appointedByMe;
    }

}