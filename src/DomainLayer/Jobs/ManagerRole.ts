import { Role } from "./Role";

export class ManagerRole implements Role{
    canCreateProductInStore(): boolean {
        return true;
    }
}