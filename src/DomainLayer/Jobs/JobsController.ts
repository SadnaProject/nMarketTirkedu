import { Mixin } from "ts-mixer";
import { HasControllers } from "../HasController";
import { type StoreDTO } from "../Stores/Store";
import { type UserDTO } from "../Users/User";
import { Testable, testable } from "~/Testable";

export interface IJobsController {
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
  getStoresByOwner(userId: string): StoreDTO[];
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
  getStoresByManager(userId: string): StoreDTO[];
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
   * This function returns whether a user has permission to create a product in a store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   */
  canCreateProductInStore(
    userId: string,
    storeId: string
  ): boolean;
  /**
   * This function returns whether a user has permission to remove a product from a store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
    */
  canRemoveProductFromStore(
    userId: string,
    storeId: string
  ): boolean;
  /**
   * This function returns whether a user has permission to edit a product in a store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
    */ 
  canEditProductInStore(
    userId: string,
    storeId: string
  ): boolean;
  /**
   * This function returns whether a user has permission to active the store
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canActivateStore( 
    userId: string,
    storeId: string
  ): boolean;
  /**
   * This function returns whether a user has permission to deactivate the store
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
    */
  canDeactivateStore( 
    userId: string,
    storeId: string
  ): boolean;
  /**
   * This function returns whether a user has permission to close the store permanently
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   */
  canCloseStorePermanently(
    userId: string,
    storeId: string
  ): boolean;

  //! Add more permission functions - should we do it using enum instead?
  /**
   * This function checks if a user is a store owner.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns A boolean that represents the permission.
   */
  isStoreOwner(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a store manager.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns A boolean that represents if the user is a store manager.
   */
  isStoreManager(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a store founder.
   * @param userId The id of the user that is being checked.
   * @param storeId The id of the store that the user is being checked in.
   * @returns A boolean that represents if the user is a store founder.
   */
  isStoreFounder(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user is a system admin.
   * @param userId The id of the user that is being checked.
   * @returns A boolean that represents if the user is a system admin.
   */
  isSystemAdmin(userId: string): boolean;
  /**
   * This function gets the founder of a store.
   * @param storeId The id of the store.
   * @returns The founder of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreFounder(storeId: string): UserDTO;
  /**
   * This function gets the owners of a store.
   * @param storeId The id of the store.
   * @returns The owners of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreOwners(storeId: string): UserDTO[];
  /**
   * This function gets the managers of a store.
   * @param storeId The id of the store.
   * @returns The managers of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreManagers(storeId: string): UserDTO[];
}

@testable
export class JobsController
  extends Mixin(Testable, HasControllers)
  implements IJobsController
{
  constructor() {
    super();
  }
  makeStoreOwner(currentId: string, storeId: string, targetUserId: string): void {
    throw new Error("Method not implemented.");
  }
  getStoresByOwner(userId: string): StoreDTO[] {
    throw new Error("Method not implemented.");
  }
  makeStoreManager(currentId: string, storeId: string, targetUserId: string): void {
    throw new Error("Method not implemented.");
  }
  getStoresByManager(userId: string): StoreDTO[] {
    throw new Error("Method not implemented.");
  }
  removeStoreOwner(currentId: string, storeId: string, targetUserId: string): void {
    throw new Error("Method not implemented.");
  }
  removeStoreManager(currentId: string, storeId: string, targetUserId: string): void {
    throw new Error("Method not implemented.");
  }
  setAddingProductToStorePermission(currentId: string, storeId: string, targetUserId: string, permission: boolean): void {
    throw new Error("Method not implemented.");
  }
  canCreateProductInStore(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  canRemoveProductFromStore(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  canEditProductInStore(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  canActivateStore(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  canDeactivateStore(userId: string, storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  canCloseStorePermanently(userId: string, storeId: string): boolean {
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
  isSystemAdmin(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  getStoreFounder(storeId: string): UserDTO {
    throw new Error("Method not implemented.");
  }
  getStoreOwners(storeId: string): UserDTO[] {
    throw new Error("Method not implemented.");
  }
  getStoreManagers(storeId: string): UserDTO[] {
    throw new Error("Method not implemented.");
  }

}
