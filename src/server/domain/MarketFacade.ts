import {
  type StoreProductDTO,
  type StoreProductArgs,
} from "./Stores/StoreProduct";
import { type SearchArgs } from "./Stores/StoresController";
import { type CartPurchaseDTO } from "./PurchasesHistory/CartPurchaseHistory";
import { type BasketPurchaseDTO } from "./PurchasesHistory/BasketPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { type PaymentDetails } from "./PurchasesHistory/PaymentAdaptor";
import { type StoreDTO } from "./Stores/Store";
import {
  type IDiscount,
  type DiscountArgs,
} from "./Stores/DiscountPolicy/Discount";
import {
  type ICondition,
  type ConditionArgs,
} from "./Stores/Conditions/CompositeLogicalCondition/Condition";
import { type Permission, type RoleType } from "./Jobs/Role";
import { type BidArgs, type BidDTO } from "./Users/Bid";
import { type PositionHolderDTO } from "./Jobs/PositionHolder";
import { Loggable, censored, loggable } from "./helpers/_Loggable";
import { createControllers } from "./helpers/_createControllers";
import { type Controllers } from "./helpers/_HasController";
import { eventEmitter } from "./helpers/_EventEmitter";

// @transactional
@loggable
export class MarketFacade extends Loggable {
  private controllers: Controllers;

  constructor() {
    super();
    this.controllers = createControllers();
    //await this.initializeSystemAdmin();
  }
  private async initializeSystemAdmin() {
    const userId = await this.controllers.Users.register(
      "admin@gmail.com",
      "admin"
    );
    await this.controllers.Jobs.setInitialAdmin(userId);
    return userId;
  }

  private validateConnection(userId: string): void {
    //TODO fix this
    // if (!this.controllers.Auth.isConnected(userId))
    //   throw new TRPCError({
    //     code: "UNAUTHORIZED",
    //     message: "User is not logged in",
    //   });
  }

  public async getLogs(userId: string) {
    this.validateConnection(userId);
    if (await this.isSystemAdmin(userId)) {
      return this.Logs;
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not system admin",
    });
  }

  public async getErrors(userId: string) {
    this.validateConnection(userId);
    if (await this.isSystemAdmin(userId)) {
      return this.Errors;
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not system admin",
    });
  }

  //Checking if user is logged in is done here.
  public async addProductToCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.validateConnection(userId);
    await this.controllers.Users.addProductToCart(userId, productId, quantity);
  }
  public async removeProductFromCart(userId: string, productId: string) {
    this.validateConnection(userId);
    await this.controllers.Users.removeProductFromCart(userId, productId);
  }
  public async editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.validateConnection(userId);
    await this.controllers.Users.editProductQuantityInCart(
      userId,
      productId,
      quantity
    );
  }
  public getCart(userId: string) {
    this.validateConnection(userId);
    return this.controllers.Users.getCart(userId);
  }
  public getNotifications(userId: string) {
    this.validateConnection(userId);
    return this.controllers.Users.getNotifications(userId);
    //return eventEmitter.getUnreadNotifications(userId); // todo fix
  }

  public purchaseCart(
    userId: string,
    @censored creditCard: PaymentDetails,
    @censored
    delivery: {
      address: string;
      city: string;
      country: string;
      name: string;
      zip: string;
    }
  ) {
    this.validateConnection(userId);
    return this.controllers.Users.purchaseCart(userId, creditCard, delivery);
  }

  public async removeUser(userId: string) {
    await this.controllers.Users.removeUser(userId);
  }
  public async readNotification(userId: string, notificationId: string) {
    this.validateConnection(userId);
    await this.controllers.Users.readNotification(userId, notificationId);
  }
  public async addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ) {
    await this.controllers.Users.addNotification(
      userId,
      notificationType,
      notificationMsg
    );
  }
  public getUnreadNotifications(userId: string) {
    this.validateConnection(userId);
    return this.controllers.Users.getUnreadNotifications(userId);
  }
  public async reviewStore(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ) {
    this.validateConnection(userId);
    await this.controllers.PurchasesHistory.addStorePurchaseReview(
      userId,
      purchaseId,
      storeId,
      review
    );
  }

  public async reviewProduct(
    userId: string,
    purchaseId: string,
    productId: string,
    review: number,
    reviewTitle: string,
    reviewDescription: string,
    storeId: string
  ) {
    this.validateConnection(userId);
    await this.controllers.PurchasesHistory.addProductPurchaseReview(
      userId,
      purchaseId,
      productId,
      review,
      reviewTitle,
      reviewDescription,
      storeId
    );
  }

  public getStoreRating(storeId: string) {
    return this.controllers.PurchasesHistory.getStoreRating(storeId);
  }

  isGuest(userId: string): boolean {
    return this.controllers.Auth.isGuest(userId);
  }
  async isMember(userId: string): Promise<boolean> {
    return await this.controllers.Auth.isMember(userId);
  }

  async isConnected(userId: string): Promise<boolean> {
    return await this.controllers.Auth.isConnected(userId);
  }

  // register(email: string, @censored password: string): void {
  //   this.controllers.Auth.register(email, password);
  // }

  async changeEmail(userId: string, newEmail: string): Promise<void> {
    await this.controllers.Auth.changeEmail(userId, newEmail);
  }

  async changePassword(
    userId: string,
    @censored oldPassword: string,
    @censored newPassword: string
  ): Promise<void> {
    await this.controllers.Auth.changePassword(
      userId,
      oldPassword,
      newPassword
    );
  }

  async getMyPurchaseHistory(userId: string): Promise<CartPurchaseDTO[]> {
    this.validateConnection(userId);
    return await this.controllers.PurchasesHistory.getMyPurchases(userId);
  }
  async makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    this.validateConnection(currentId);
    // console.log("makeStoreOwner");
    await this.controllers.Stores.makeStoreOwner(
      currentId,
      storeId,
      targetUserId
    );
  }

  async makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Stores.makeStoreManager(
      currentId,
      storeId,
      targetUserId
    );
  }

  async removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Stores.removeStoreOwner(
      currentId,
      storeId,
      targetUserId
    );
  }

  async removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Stores.removeStoreManager(
      currentId,
      storeId,
      targetUserId
    );
  }
  async setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Stores.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async setRemovingProductFromStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Jobs.setRemovingProductFromStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async setEditingProductInStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Jobs.setEditingProductInStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async setModifyingPurchasePolicyPermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Jobs.setModifyingPurchasePolicyPermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async setReceivingPrivateStoreDataPermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    this.validateConnection(currentId);
    await this.controllers.Jobs.setReceivingPrivateStoreDataPermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async canCreateProductInStore(
    currentId: string,
    storeId: string
  ): Promise<boolean> {
    this.validateConnection(currentId);
    return await this.controllers.Stores.canCreateProductInStore(
      currentId,
      storeId
    );
  }
  async canEditProductInStore(
    currentId: string,
    storeId: string
  ): Promise<boolean> {
    this.validateConnection(currentId);
    return await this.controllers.Jobs.canEditProductInStore(
      currentId,
      storeId
    );
  }
  async isStoreOwner(userId: string, storeId: string): Promise<boolean> {
    return await this.controllers.Stores.isStoreOwner(userId, storeId);
  }
  async isStoreManager(userId: string, storeId: string): Promise<boolean> {
    return await this.controllers.Stores.isStoreManager(userId, storeId);
  }
  async isStoreFounder(userId: string, storeId: string): Promise<boolean> {
    return await this.controllers.Stores.isStoreFounder(userId, storeId);
  }
  async isSystemAdmin(userId: string): Promise<boolean> {
    return await this.controllers.Jobs.isSystemAdmin(userId);
  }
  async getStoreFounder(storeId: string): Promise<string> {
    return await this.controllers.Stores.getStoreFounderId(storeId);
  }
  async getStoreOwners(storeId: string): Promise<string[]> {
    return await this.controllers.Stores.getStoreOwnersIds(storeId);
  }
  async getStoreManagers(storeId: string): Promise<string[]> {
    return await this.controllers.Stores.getStoreManagersIds(storeId);
  }
  async createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): Promise<string> {
    this.validateConnection(userId);
    return await this.controllers.Stores.createProduct(
      userId,
      storeId,
      product
    );
  }
  async isStoreActive(userId: string, storeId: string): Promise<boolean> {
    return await this.controllers.Stores.isStoreActive(userId, storeId);
  }
  async getStoreProducts(
    userId: string,
    storeId: string
  ): Promise<StoreProductDTO[]> {
    return await this.controllers.Stores.getStoreProducts(userId, storeId);
  }
  async setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.setProductQuantity(
      userId,
      productId,
      quantity
    );
  }
  async decreaseProductQuantity(
    productId: string,
    quantity: number
  ): Promise<void> {
    await this.controllers.Stores.decreaseProductQuantity(productId, quantity);
  }
  async deleteProduct(userId: string, productId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.deleteProduct(userId, productId);
  }
  async setProductPrice(
    userId: string,
    productId: string,
    price: number
  ): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.setProductPrice(userId, productId, price);
  }

  async createStore(founderId: string, storeName: string): Promise<string> {
    this.validateConnection(founderId);
    return await this.controllers.Stores.createStore(founderId, storeName);
  }
  async activateStore(userId: string, storeId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.activateStore(userId, storeId);
  }
  async deactivateStore(userId: string, storeId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.deactivateStore(userId, storeId);
  }
  async closeStorePermanently(userId: string, storeId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.closeStorePermanently(userId, storeId);
  }
  async getProductPrice(userId: string, productId: string): Promise<number> {
    return await this.controllers.Stores.getProductPrice(userId, productId);
  }
  async getProductById(
    userId: string,
    productId: string
  ): Promise<StoreProductDTO> {
    return await this.controllers.Stores.getProductById(userId, productId);
  }
  async isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    return await this.controllers.Stores.isProductQuantityInStock(
      userId,
      productId,
      quantity
    );
  }
  async getStoreIdByProductId(
    userId: string,
    productId: string
  ): Promise<string> {
    return await this.controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
  }
  async getCartPrice(userId: string): Promise<number> {
    return await this.controllers.Stores.getCartPrice(userId);
  }
  async getBasketPrice(userId: string, storeId: string): Promise<number> {
    return await this.controllers.Stores.getBasketPrice(userId, storeId);
  }
  async searchProducts(
    userId: string,
    searchArgs: SearchArgs
  ): Promise<StoreProductDTO[]> {
    return await this.controllers.Stores.searchProducts(userId, searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public async startSession(): Promise<string> {
    return this.controllers.Users.startSession();
  }

  public async registerMember(
    userId: string,
    email: string,
    @censored password: string
  ): Promise<string> {
    this.validateConnection(userId);
    return this.controllers.Users.register(email, password);
  }
  // eslint-disable-next-line jsdoc/require-description
  /**
   *
   * @param userIdOfActor The user id of the user that asks to remove the member.
   * @param memberIdToRemove The user id of the member to remove.
   * @throws Error if the asking user doesn't have the permission to remove the member(i.e the asking user is not the system admin).
   * @throws Error if the member to remove is not a member.
   * @throws Error if the member has any position(he cant be removed if he has any position).
   */
  async removeMember(userIdOfActor: string, memberIdToRemove: string) {
    this.validateConnection(userIdOfActor);
    await this.controllers.Users.removeMember(userIdOfActor, memberIdToRemove);
  }
  public async loginMember(
    userId: string,
    email: string,
    @censored password: string
  ): Promise<string> {
    this.validateConnection(userId);
    return this.controllers.Users.login(userId, email, password);
  }
  public reConnectMember(userId: string): Promise<void> {
    // this.validateConnection(userId);
    return this.controllers.Auth.reConnectMember(userId);
  }
  public logoutMember(userId: string): Promise<string> {
    this.validateConnection(userId);
    return this.controllers.Users.logout(userId);
  }
  //This is not called logout because it also disconnects guest users which were not logged in.
  //disconnects a user. if the user is a guest user, the user is removed from the system.
  //if the user is a member user, the users session is invalidated.
  public async disconnectUser(userId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Users.disconnect(userId);
  }

  public async getPurchasesByUser(
    adminId: string,
    userId: string
  ): Promise<CartPurchaseDTO[]> {
    return await this.controllers.PurchasesHistory.getPurchasesByUser(
      adminId,
      userId
    );
  }
  public async getPurchasesByStore(
    userId: string,
    storeId: string
  ): Promise<BasketPurchaseDTO[]> {
    return await this.controllers.Stores.getPurchasesByStoreId(userId, storeId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged in members ids.
   * @returns Array of strings.
   */
  async getAllLoggedInMembersIds(userId: string): Promise<string[]> {
    this.validateConnection(userId);
    return await this.controllers.Auth.getAllLoggedInMembersIds(userId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  async getAllLoggedOutMembersIds(userId: string): Promise<string[]> {
    this.validateConnection(userId);
    return await this.controllers.Auth.getAllLoggedOutMembersIds(userId);
  }
  async searchStores(userId: string, storeName: string): Promise<StoreDTO[]> {
    this.validateConnection(userId);
    return await this.controllers.Stores.searchStores(userId, storeName);
  }
  async addDiscountToStore(
    userId: string,
    storeId: string,
    discount: DiscountArgs
  ): Promise<string> {
    this.validateConnection(userId);
    return await this.controllers.Stores.addDiscountToStore(
      userId,
      storeId,
      discount
    );
  }
  async removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.removeDiscountFromStore(
      userId,
      storeId,
      discountId
    );
  }
  async addConstraintToStore(
    userId: string,
    storeId: string,
    constraint: ConditionArgs
  ): Promise<string> {
    this.validateConnection(userId);
    return await this.controllers.Stores.addConstraintToStore(
      userId,
      storeId,
      constraint
    );
  }
  async removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Stores.removeConstraintFromStore(
      userId,
      storeId,
      constraintId
    );
  }
  async myStores(
    userId: string
  ): Promise<{ store: StoreDTO; role: RoleType }[]> {
    this.validateConnection(userId);
    return await this.controllers.Stores.myStores(userId);
  }
  async addBid(bid: BidArgs) {
    this.validateConnection(bid.userId);
    await this.controllers.Users.addBid(bid);
  }
  async getBidsFromMe(userId: string): Promise<BidDTO[]> {
    this.validateConnection(userId);
    return this.controllers.Users.getAllBidsSendFromUser(userId);
  }
  async getBidsToMe(userId: string): Promise<BidDTO[]> {
    this.validateConnection(userId);
    return this.controllers.Users.getAllBidsSendToUser(userId);
  }
  async approveBid(userId: string, bidId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Users.approveBid(userId, bidId);
  }
  async rejectBid(userId: string, bidId: string): Promise<void> {
    this.validateConnection(userId);
    await this.controllers.Users.rejectBid(userId, bidId);
  }
  removeVoteFromBid(userId: string, bidId: string): void {
    this.validateConnection(userId);
    this.controllers.Users.removeVoteFromBid(userId, bidId);
  }
  async getJobsHierarchyOfStore(
    userId: string,
    storeId: string
  ): Promise<PositionHolderDTO> {
    this.validateConnection(userId);
    // console.log("getJobsHierarchyOfStore");
    return await this.controllers.Jobs.getJobsHierarchyOfStore(storeId);
  }
  async getMemberIdByEmail(email: string): Promise<string> {
    return await this.controllers.Auth.getMemberIdByEmail(email);
  }
  async getStoreDiscounts(userId: string, storeId: string) {
    this.validateConnection(userId);
    return await this.controllers.Stores.getDiscountPolicy(userId, storeId);
  }
  async getStoreConstraints(userId: string, storeId: string) {
    this.validateConnection(userId);
    return await this.controllers.Stores.getConstraintPolicy(userId, storeId);
  }
  async getStoreNameById(userId: string, storeId: string): Promise<string> {
    this.validateConnection(userId);
    return await this.controllers.Stores.getStoreNameById(userId, storeId);
  }
  async getPermissionsOfUser(
    userId: string,
    storeId: string
  ): Promise<Permission[]> {
    this.validateConnection(userId);
    return await this.controllers.Jobs.getPermissionsOfUser(userId, storeId);
  }
}
