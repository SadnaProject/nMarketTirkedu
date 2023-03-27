interface IJobController {
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  getStoresByOwner(userId: string): never;
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  getStoresByManager(userId: string): never;
  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void;
  getAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): boolean;
  //! Add more permission functions - should we do it using enum instead?
  isStoreOwner(userId: string, storeId: string): boolean;
  isStoreManager(userId: string, storeId: string): boolean;
  isStoreFounder(userId: string, storeId: string): boolean;
  isSystemAdmin(userId: string): boolean;
}

export class JobController implements IJobController {
  isSystemAdmin(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    throw new Error("Method not implemented.");
  }
  getStoresByOwner(userId: string): never {
    throw new Error("Method not implemented.");
  }
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    throw new Error("Method not implemented.");
  }
  getStoresByManager(userId: string): never {
    throw new Error("Method not implemented.");
  }
  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    throw new Error("Method not implemented.");
  }
  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    throw new Error("Method not implemented.");
  }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    throw new Error("Method not implemented.");
  }
  getAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): boolean {
    throw new Error("Method not implemented.");
  }
  isStoreOwner(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isStoreManager(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isStoreFounder(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
}
