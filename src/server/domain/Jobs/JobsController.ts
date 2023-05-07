import { Mixin } from "ts-mixer";
import { HasControllers } from "../_HasController";
import { type StoreDTO } from "../Stores/Store";
import { Testable, testable } from "server/domain/_Testable";
import { ManagerRole } from "./ManagerRole";
import { OwnerRole } from "./OwnerRole";
import { HasRepos, createRepos } from "./_HasRepos";
import { PositionHolder } from "./PositionHolder";
import { FounderRole } from "./FounderRole";
import { type EditablePermission } from "./Role";
import { TRPCError } from "@trpc/server";

export interface IJobsController {
  /**
   * This function initializes the store's position holders, and setting the founder.
   * @param founderId The id of the user that will be the founder of the store.
   * @param storeId The id of the store.
   */
  InitializeStore(founderId: string, storeId: string): void;

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
   * This function gets the stores that a user is a founder of.
   * @param userId The id of the user that we want to get the stores of.
   * @returns The store Id's that the user is a founder of.
   * @returns An empty array if the user wasn't found.
   */
  getStoreIdsByFounder(userId: string): string[];
  /**
   * This function gets the stores that a user is a owner of.
   * @param userId The id of the user that we want to get the stores of.
   * @returns The store Id's that the user is a owner of.
   * @returns An empty array if the user wasn't found.
   */
  getStoreIdsByOwner(userId: string): string[];
  /**
   * This function gets the stores that a user is a manager of.
   * @param userId The id of the user that we want to get the stores of.
   * @returns The store Id's that the user is a manager of.
   * @returns An empty array if the user wasn't found.
   */
  getStoreIdsByManager(userId: string): string[];
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
   * @param storeId The id of the store that is related to the permission.
   * @param targetUserId The id of the user that his permission is being set.
   * @param permission The permission that is being set.
   */
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void;
  /**
   * This function sets the permission of a user to remove products from a store.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that is related to the permission.
   * @param targetUserId The id of the user that his permission is being set.
   * @param permission The permission that is being set( true = can remove, false = can't remove).
   */
  setRemovingProductFromStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void;
  /**
   * This function sets the permission of a user to edit products in a store.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that is related to the permission.
   * @param targetUserId The id of the user that his permission is being set.
   * @param permission The permission that is being set( true = can edit, false = can't edit).
   */
  setEditingProductInStorePermission(
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
  canCreateProductInStore(userId: string, storeId: string): boolean;
  /**
   * This function returns whether a user has permission to remove a product from a store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canRemoveProductFromStore(userId: string, storeId: string): boolean;
  /**
   * This function returns whether a user has permission to edit a product in a store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canEditProductInStore(userId: string, storeId: string): boolean;
  /**
   * This function returns whether a user has permission to active the store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canActivateStore(userId: string, storeId: string): boolean;
  /**
   * This function returns whether a user has permission to deactivate the store.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   * @returns A boolean that represents the permission.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canDeactivateStore(userId: string, storeId: string): boolean;
  /**
   * This function returns whether a user has permission to close the store permanently.
   * @param userId The id of the user that we are checking the permission of.
   * @param storeId The id of the store related to the permission.
   */
  canCloseStorePermanently(userId: string, storeId: string): boolean;

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
   * @returns The id of the founder of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreFounderId(storeId: string): string;
  /**
   * This function gets the owners of a store.
   * @param storeId The id of the store.
   * @returns The id's of the owners of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreOwnersIds(storeId: string): string[];
  /**
   * This function gets the managers of a store.
   * @param storeId The id of the store.
   * @returns The id's of the managers of the store.
   * @throws Error if the store doesn't exist.
   */
  getStoreManagersIds(storeId: string): string[];
  /**
   *
   */
  setInitialAdmin(userId: string): void;
  /**
   * This function checks if a user can receive any data from a store(owners, managers, products, etc.).
   * @param userId
   * @param storeId
   */
  canReceivePrivateDataFromStore(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user can receive public data from a store.
   * @param userId
   * @param storeId
   * @returns A boolean that represents if the user can receive public data from a store.
   * @throws Error if the store doesn't exist.
   * @throws Error if the user doesn't exist.
   */
  canReceivePublicDataFromStore(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user can receive purchase history from a store.
   * @param userId
   * @param storeId
   */
  canReceivePurchaseHistoryFromStore(userId: string, storeId: string): boolean;
  /**
   * This function checks if a user has the permission to remove a member of the system.
   * @param userId The id of the user that is being checked.
   */
  canRemoveMember(userId: string): boolean;
  /**
   * This function checks if a user has any position in the system(Owner, Manager, Founder,System Admin).
   * @param userId The id of the user that is being checked.
   * @returns A boolean that represents if the user has any position in the system.
   * @throws Error if the user doesn't exist.
   */
  isMemberInAnyPosition(userId: string): boolean;
}

@testable
export class JobsController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IJobsController
{
  // private managerRole: ManagerRole;
  static ownerRole: OwnerRole = new OwnerRole();
  static founderRole: FounderRole = new FounderRole();
  private wasAdminInitialized: boolean;
  constructor() {
    super();
    this.initRepos(createRepos());
    this.wasAdminInitialized = false;
    this.initRepos(createRepos());
    // this.initializeSystemAdmin();
    // this.managerRole = new ManagerRole();
    // this.ownerRole = new OwnerRole();
    // this.founderRole = new FounderRole();
  }
  // private initializeSystemAdmin() {
  //   const userId = this.Controllers.Auth.register("admin", "admin");
  //   this.setInitialAdmin(userId);
  // }

  canReceivePrivateDataFromStore(userId: string, storeId: string): boolean {
    const positionHolder: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (positionHolder === undefined) {
      return false;
    }

    if (this.Controllers.Stores.isStoreActive(userId, storeId))
      return positionHolder.Role.hasPermission("receivePrivateStoreData");
    else
      return (
        positionHolder.Role.hasPermission("receiveClosedStoreData") &&
        positionHolder.Role.hasPermission("receivePrivateStoreData")
      );
  }
  canReceivePublicDataFromStore(userId: string, storeId: string): boolean {
    if (this.Controllers.Stores.isStoreActive(userId, storeId)) return true;
    const positionHolder: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (positionHolder === undefined) {
      return false;
    }
    return positionHolder.Role.hasPermission("receiveClosedStoreData");
  }

  canReceivePurchaseHistoryFromStore(userId: string, storeId: string): boolean {
    if (this.isSystemAdmin(userId)) {
      return true;
    }
    const positionHolder: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (positionHolder === undefined) {
      return false;
    }
    return positionHolder.Role.hasPermission("receivePrivateStoreData");
  }

  InitializeStore(founderId: string, storeId: string): void {
    const positionHolder: PositionHolder = new PositionHolder(
      JobsController.founderRole,
      storeId,
      founderId
    );
    this.Repos.jobs.SetStoreFounder(positionHolder);
  }
  getStoreIdsByFounder(userId: string): string[] {
    const storeIds = this.Repos.jobs.getAllStoreIds();
    const foundedStores: string[] = [];
    for (const storeId of storeIds) {
      if (this.isStoreFounder(userId, storeId)) {
        foundedStores.push(storeId);
        // const positionHolder: PositionHolder = this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId,storeId);
      }
    }
    return foundedStores;
  }
  getStoreIdsByOwner(userId: string): string[] {
    const storeIds = this.Repos.jobs.getAllStoreIds();
    const ownedStores: string[] = [];
    for (const storeId of storeIds) {
      if (this.isStoreOwner(userId, storeId)) {
        ownedStores.push(storeId);
      }
    }
    return ownedStores;
  }
  getStoreIdsByManager(userId: string): string[] {
    const storeIds = this.Repos.jobs.getAllStoreIds();
    const managedStores: string[] = [];
    for (const storeId of storeIds) {
      if (this.isStoreManager(userId, storeId)) {
        managedStores.push(storeId);
      }
    }
    return managedStores;
  }
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    // throw new Error("Method not implemented.");
    const phAppointer: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(currentId, storeId);
    if (phAppointer === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user cannot appoint",
      });
    }
    const positionHolder: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(
        targetUserId,
        storeId
      );
    if (positionHolder === undefined) {
      phAppointer.appointStoreOwner(targetUserId);
    } else {
      if (positionHolder.Role.canBeAppointedToStoreOwner()) {
        this.removePositionHolder(positionHolder); //TODO - is this what we want to do in this case? or should we hold two roles/positions for the same user?
        phAppointer.appointStoreOwner(targetUserId);
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This user cannot be appointed to store owner",
        });
      }
    }
  }

  getStoresByOwner(userId: string): StoreDTO[] {
    throw new Error("Method Deprecated.");
  }
  getStoresByManager(userId: string): StoreDTO[] {
    throw new Error("Method Deprecated");
  }
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    const phAppointer: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(currentId, storeId);
    if (phAppointer === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user cannot appoint",
      });
    }
    const positionHolder: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(
        targetUserId,
        storeId
      );
    if (positionHolder === undefined) {
      phAppointer.appointStoreManager(targetUserId);
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "This user cannot be appointed as he is already a position holder in this store",
      });
    }
  }

  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.removeAppointee(currentId, storeId, targetUserId);
  }

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.removeAppointee(currentId, storeId, targetUserId);
  }
  private removeAppointee(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    const phRemover: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(currentId, storeId);
    if (phRemover === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user cannot remove appointee",
      });
    }
    phRemover.removeAppointee(targetUserId);
  }
  private setAppointeePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permissionStatus: boolean,
    permission: EditablePermission
  ): void {
    const phAppointer: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(currentId, storeId);
    if (phAppointer === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user cannot appoint",
      });
    }
    phAppointer.setAppointeePermission(
      targetUserId,
      permissionStatus,
      permission
    );
  }
  //

  // private wasAppointedByUser(appointer: string, storeId: string, appointee: string): boolean{
  //   throw new Error("Method not implemented.");
  // }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.setAppointeePermission(
      currentId,
      storeId,
      targetUserId,
      permission,
      "AddProduct"
    );
  }
  setRemovingProductFromStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.setAppointeePermission(
      currentId,
      storeId,
      targetUserId,
      permission,
      "RemoveProduct"
    );
  }
  setEditingProductInStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.setAppointeePermission(
      currentId,
      storeId,
      targetUserId,
      permission,
      "EditProductDetails"
    );
  }

  canCreateProductInStore(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.hasPermission("AddProduct");
  }
  canRemoveProductFromStore(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.hasPermission("RemoveProduct");
  }
  canEditProductInStore(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.hasPermission("EditProductDetails");
  }
  canActivateStore(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.hasPermission("ActivateStore");
  }
  canDeactivateStore(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.hasPermission("DeactivateStore");
  }
  canCloseStorePermanently(userId: string, storeId: string): boolean {
    return this.isSystemAdmin(userId);
  }
  isStoreOwner(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.isStoreOwner();
  }
  isStoreManager(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.isStoreManager();
  }
  isStoreFounder(userId: string, storeId: string): boolean {
    const ph: PositionHolder | undefined =
      this.Repos.jobs.getPositionHolderByUserIdAndStoreId(userId, storeId);
    if (ph === undefined) {
      return false;
    }
    return ph.Role.isStoreFounder();
  }
  isSystemAdmin(userId: string): boolean {
    if (
      this.Repos.jobs.getSystemAdmins().find((saId) => saId === userId) ===
      undefined
    ) {
      return false;
    }
    return true;
  }

  setInitialAdmin(userId: string): void {
    if (this.wasAdminInitialized) {
      throw new Error("admin was already initialized");
    }
    this.Repos.jobs.addSystemAdmin(userId);
    this.wasAdminInitialized = true;
  }
  getStoreFounderId(storeId: string): string {
    return this.Repos.jobs.GetStoreFounder(storeId).UserId;
  }
  getStoreOwnersIds(storeId: string): string[] {
    return this.Repos.jobs
      .getAllPositionHoldersByStoreId(storeId)
      .filter((ph) => ph.Role.isStoreOwner())
      .map((ph) => ph.UserId);
  }
  getStoreManagersIds(storeId: string): string[] {
    return this.Repos.jobs
      .getAllPositionHoldersByStoreId(storeId)
      .filter((ph) => ph.Role.isStoreManager())
      .map((ph) => ph.UserId);
  }
  private removePositionHolder(positionHolder: PositionHolder): void {
    const founder = this.Repos.jobs.GetStoreFounder(positionHolder.StoreId);
    //find the position holder in the founder's tree
    const parent = this.findParent(positionHolder, founder);
    if (parent === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Position holder not found",
      });
    }
    const index = parent.Appointments.indexOf(positionHolder);
    if (index === -1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Position holder not found",
      });
    }
    parent.Appointments.splice(index, 1);
  }
  private findParent(
    positionHolder: PositionHolder,
    parent: PositionHolder
  ): PositionHolder | undefined {
    if (parent.Appointments.includes(positionHolder)) {
      return parent;
    }
    for (const appointedByMe of parent.Appointments) {
      const found = this.findParent(positionHolder, appointedByMe);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }
  canRemoveMember(userId: string): boolean {
    return this.isSystemAdmin(userId);
  }
  isMemberInAnyPosition(userId: string): boolean {
    if (this.isSystemAdmin(userId)) {
      return true;
    }
    if (this.getStoreIdsByFounder(userId).length > 0) {
      return true;
    }
    if (this.getStoreIdsByOwner(userId).length > 0) {
      return true;
    }
    if (this.getStoreIdsByManager(userId).length > 0) {
      return true;
    }
    return false;
  }
}
