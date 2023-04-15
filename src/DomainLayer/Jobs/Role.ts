export type Permission = "DeactivateStore"|"ActivateStore" |EditablePermission;
export type EditablePermission = 'AddProduct' | 'EditProductDetails' | 'RemoveProduct'|'SeeStoreData';
export abstract class Role{   
    protected permissions: Permission[];
    constructor(){
        this.permissions = [];
    }
    abstract grantPermission(permission: EditablePermission): void;
    abstract revokePermission(permission: EditablePermission): void;
    hasPermission(permission: Permission): boolean{
        return this.permissions.includes(permission);    
    }   
}


