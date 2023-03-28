interface IJobController {

     

  /**
 * This function makes a user a store owner when they are added to a store.
 * @param currentId The id of the user that is currently logged in.
 * @param storeId The id of the store that the user is being added to.
 * @param targetUserId The id of the user that is being added to the store.
 */

makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  
  /**
   * 
   * @param userId The id of the user that is currently logged in.
   * @returns The stores that the user is an owner of.
   */
  getStoresByOwner(userId: string): never;
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  /**
   * This function gets the stores that a user is a manager of.
   * @param userId The id of the user that is currently logged in.
   * @returns The stores that the user is a manager of.
    */
  getStoresByManager(userId: string): never;
  /**
   * This function removes a user from being a store owner.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being removed from.
   * @param targetUserId The id of the user that is being removed from the store.
   */
  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  /**
   * This function removes a user from being a store manager.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being removed from.
   * @param targetUserId The id of the user that is being removed from the store.
    */

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  /**
   * This function sets the permission of a user to add products to a store.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being added to.
   * @param targetUserId The id of the user that is being added to the store.
   * @param permission The permission that is being set.
   * @returns The stores that the user is a manager of.
    */
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void;
  /**
   * This function gets the permission of a user to add products to a store.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store related to the permission.
   * @param targetUserId The id of the user that we are checking the permission of.
   * @returns a boolean that represents the permission.
   * 
    */
  getAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): boolean;
  //! Add more permission functions - should we do it using enum instead?
  /**
   * This function checks if a user is a store owner.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns a boolean that represents the permission.
  */
  isStoreOwner(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a store manager.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns a boolean that represents if the user is a store manager.
   */
  isStoreManager(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a store founder.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns a boolean that represents if the user is a store founder.
    */
  isStoreFounder(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a system admin.
   * @param userId The id of the user that is being checked.
   * @returns a boolean that represents if the user is a system admin.
    */
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
