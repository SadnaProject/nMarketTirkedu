import { type Controllers } from "./_HasController";
import { type CartDTO } from "./Users/Cart";
import { createControllers } from "./_createControllers";
import { type BasketDTO } from "./Users/Basket";
import {
  type StoreProductDTO,
  type StoreProductArgs,
} from "./Stores/StoreProduct";
import { Loggable, censored, loggable } from "./_Loggable";
import { type SearchArgs } from "./Stores/StoresController";
import { type CartPurchaseDTO } from "./PurchasesHistory/CartPurchaseHistory";
import { type BasketPurchaseDTO } from "./PurchasesHistory/BasketPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { type CreditCard } from "./PurchasesHistory/PaymentAdaptor";
import { type StoreDTO } from "./Stores/Store";
import { type DiscountArgs } from "./Stores/DiscountPolicy/Discount";
import { type ConditionArgs } from "./Stores/Conditions/CompositeLogicalCondition/Condition";
import { type RoleType } from "./Jobs/Role";
import { type BidArgs, type BidDTO } from "./Users/Bid";

@loggable
export class MarketFacade extends Loggable {
  private controllers: Controllers;

  constructor() {
    super();
    this.controllers = createControllers();
    this.initializeSystemAdmin();
  }
  private initializeSystemAdmin() {
    const userId = this.controllers.Users.register("admin@gmail.com", "admin");
    this.controllers.Jobs.setInitialAdmin(userId);
  }

  private validateConnection(userId: string): void {
    //TODO fix this
    // if (!this.controllers.Auth.isConnected(userId))
    //   throw new TRPCError({
    //     code: "UNAUTHORIZED",
    //     message: "User is not logged in",
    //   });
  }

  public getLogs(userId: string) {
    this.validateConnection(userId);
    if (this.isSystemAdmin(userId)) {
      return this.Logs;
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not system admin",
    });
  }

  public getErrors(userId: string) {
    this.validateConnection(userId);
    if (this.isSystemAdmin(userId)) {
      return this.Errors;
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not system admin",
    });
  }

  //Checking if user is logged in is done here.
  public addProductToCart(userId: string, productId: string, quantity: number) {
    this.validateConnection(userId);
    this.controllers.Users.addProductToCart(userId, productId, quantity);
  }
  public removeProductFromCart(userId: string, productId: string) {
    this.validateConnection(userId);
    this.controllers.Users.removeProductFromCart(userId, productId);
  }
  public editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.validateConnection(userId);
    this.controllers.Users.editProductQuantityInCart(
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
  }

  public purchaseCart(userId: string, @censored creditCard: CreditCard) {
    this.validateConnection(userId);
    this.controllers.Users.purchaseCart(userId, creditCard);
  }

  public removeUser(userId: string) {
    this.controllers.Users.removeUser(userId);
  }
  public readNotification(userId: string, notificationId: string) {
    this.validateConnection(userId);
    this.controllers.Users.readNotification(userId, notificationId);
  }
  public addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ) {
    this.controllers.Users.addNotification(
      userId,
      notificationType,
      notificationMsg
    );
  }
  public getUnreadNotifications(userId: string) {
    this.validateConnection(userId);
    return this.controllers.Users.getUnreadNotifications(userId);
  }
  public reviewStore(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ) {
    this.validateConnection(userId);
    this.controllers.PurchasesHistory.addStorePurchaseReview(
      userId,
      purchaseId,
      storeId,
      review
    );
  }

  public reviewProduct(
    userId: string,
    purchaseId: string,
    productId: string,
    review: number,
    reviewTitle: string,
    reviewDescription: string
  ) {
    this.validateConnection(userId);
    this.controllers.PurchasesHistory.addProductPurchaseReview(
      userId,
      purchaseId,
      productId,
      review,
      reviewTitle,
      reviewDescription
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
  async makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    this.validateConnection(currentId);
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
  public startSession(): string {
    return this.controllers.Users.startSession();
  }

  public registerMember(
    userId: string,
    email: string,
    @censored password: string
  ): void {
    this.validateConnection(userId);
    this.controllers.Users.register(email, password);
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
  removeMember(userIdOfActor: string, memberIdToRemove: string) {
    this.validateConnection(userIdOfActor);
    this.controllers.Users.removeMember(userIdOfActor, memberIdToRemove);
  }
  public loginMember(
    userId: string,
    email: string,
    @censored password: string
  ): string {
    this.validateConnection(userId);
    return this.controllers.Users.login(userId, email, password);
  }
  public logoutMember(userId: string): string {
    this.validateConnection(userId);
    return this.controllers.Users.logout(userId);
  }
  //This is not called logout because it also disconnects guest users which were not logged in.
  //disconnects a user. if the user is a guest user, the user is removed from the system.
  //if the user is a member user, the users session is invalidated.
  public disconnectUser(userId: string): void {
    this.validateConnection(userId);
    this.controllers.Users.disconnect(userId);
  }

  public getPurchasesByUser(
    adminId: string,
    userId: string
  ): CartPurchaseDTO[] {
    return this.controllers.PurchasesHistory.getPurchasesByUser(
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
    return await this.controllers.Auth.getAllLoggedInMembersIds();
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  async getAllLoggedOutMembersIds(userId: string): Promise<string[]> {
    this.validateConnection(userId);
    return await this.controllers.Auth.getAllLoggedOutMembersIds();
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
  addBid(bid: BidArgs) {
    this.validateConnection(bid.userId);
    this.controllers.Users.addBid(bid);
  }
  getBidsFromMe(userId: string): BidDTO[] {
    this.validateConnection(userId);
    return this.controllers.Users.getAllBidsSendFromUser(userId);
  }
  getBidsToMe(userId: string): BidDTO[] {
    this.validateConnection(userId);
    return this.controllers.Users.getAllBidsSendToUser(userId);
  }
  approveBid(userId: string, bidId: string): void {
    this.validateConnection(userId);
    this.controllers.Users.approveBid(userId, bidId);
  }
  rejectBid(userId: string, bidId: string): void {
    this.validateConnection(userId);
    this.controllers.Users.rejectBid(userId, bidId);
  }
  removeVoteFromBid(userId: string, bidId: string): void {
    this.validateConnection(userId);
    this.controllers.Users.removeVoteFromBid(userId, bidId);
  }
}
