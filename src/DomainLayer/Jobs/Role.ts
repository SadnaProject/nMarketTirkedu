export interface Role{
    // createProductInStore: boolean;
    canCreateProductInStore(): boolean;
    canAppointStoreOwner(): boolean;
    canAppointStoreManager(): boolean;
    canBeAppointedToStoreOwner(): boolean;//this is true only for store manager
    isStoreOwner(): boolean;
    isStoreManager(): boolean;
    isStoreFounder(): boolean;


}


