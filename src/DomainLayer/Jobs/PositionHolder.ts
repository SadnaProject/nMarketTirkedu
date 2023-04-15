import { JobsController } from "./JobsController";
import { ManagerRole } from "./ManagerRole";
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
    private appointments: PositionHolder[]
    // private dto: PositionHolderDTO | undefined;

    constructor(role: Role, storeId: string, userId: string){
        this.role = role;
        this.storeId = storeId;
        this.userId = userId;
        this.appointments = [];
        // this.dto = undefined;
    }
    public static createPositionHolderFromDTO(dto: PositionHolderDTO): PositionHolder {
        const positionHolder = new PositionHolder(dto.role, dto.storeId, dto.userId);
        positionHolder.appointments = dto.appointedByMe.map((positionHolderDTO) => this.createPositionHolderFromDTO(positionHolderDTO));
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
            appointedByMe: this.appointments.map((positionHolder) => positionHolder.DTO),
        };
    }
    private addPositionHolder(positionHolder: PositionHolder): void {
        this.appointments.push(positionHolder);
        // if (this.dto !== undefined) {
        //     this.dto.appointedByMe.push(positionHolder.DTO);
        // }
    }
    public appointStoreOwner(userId: string): void {
        if(!this.role.canAppointStoreOwner()){
            throw new Error("User does not have permission to appoint store owner");
        }
        this.addPositionHolder(new PositionHolder(JobsController.ownerRole, this.storeId, userId));
        
        // const storeOwner = new PositionHolder(new StoreOwnerRole(), this.storeId, userId);
    }
    public appointStoreManager(userId: string): void {
        if(!this.role.canAppointStoreManager()){
            throw new Error("User does not have permission to appoint store manager");
        }
        this.addPositionHolder(new PositionHolder(new ManagerRole(), this.storeId, userId));
    }
    
    public removeAppointee(userId: string): void {
        const index = this.appointments.findIndex((positionHolder) => positionHolder.UserId === userId);
        if (index === -1) {
            throw new Error("User is not appointed by this position holder");
        }
        this.appointments.splice(index, 1);
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
    public get Appointments(): PositionHolder[] {
        return this.appointments;
    }

}