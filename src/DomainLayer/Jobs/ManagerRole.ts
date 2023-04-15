import { Role } from "./Role";

export class ManagerRole implements Role{
    isStoreOwner(): boolean {
        return false;
    }
    isStoreManager(): boolean {
        return true;
    }   
    isStoreFounder(): boolean {
        return false;
    }
    
    canBeAppointedToStoreOwner(): boolean {
        return true;
    }
    canAppointStoreOwner(): boolean {
       return false;
    }
    //store manager cant appoint store managers
    canAppointStoreManager(): boolean {
        return false;
    }
    canCreateProductInStore(): boolean {
        return true;
    }

}