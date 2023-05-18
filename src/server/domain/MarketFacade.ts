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
import { BidArgs } from "./Users/Bid";

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
    if (!this.controllers.Auth.isConnected(userId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not logged in",
      });
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
  isMember(userId: string): boolean {
    return this.controllers.Auth.isMember(userId);
  }

  isConnected(userId: string): boolean {
    return this.controllers.Auth.isConnected(userId);
  }

  // register(email: string, @censored password: string): void {
  //   this.controllers.Auth.register(email, password);
  // }

  changeEmail(userId: string, newEmail: string): void {
    this.controllers.Auth.changeEmail(userId, newEmail);
  }

  changePassword(
    userId: string,
    @censored oldPassword: string,
    @censored newPassword: string
  ): void {
    this.controllers.Auth.changePassword(userId, oldPassword, newPassword);
  }
  makeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    this.validateConnection(currentId);
    this.controllers.Stores.makeStoreOwner(currentId, storeId, targetUserId);
  }

  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.validateConnection(currentId);
    this.controllers.Stores.makeStoreManager(currentId, storeId, targetUserId);
  }

  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.validateConnection(currentId);
    this.controllers.Stores.removeStoreOwner(currentId, storeId, targetUserId);
  }

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.validateConnection(currentId);
    this.controllers.Stores.removeStoreManager(
      currentId,
      storeId,
      targetUserId
    );
  }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.validateConnection(currentId);
    this.controllers.Stores.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  canCreateProductInStore(currentId: string, storeId: string): boolean {
    this.validateConnection(currentId);
    return this.controllers.Stores.canCreateProductInStore(currentId, storeId);
  }
  isStoreOwner(userId: string, storeId: string): boolean {
    return this.controllers.Stores.isStoreOwner(userId, storeId);
  }
  isStoreManager(userId: string, storeId: string): boolean {
    return this.controllers.Stores.isStoreManager(userId, storeId);
  }
  isStoreFounder(userId: string, storeId: string): boolean {
    return this.controllers.Stores.isStoreFounder(userId, storeId);
  }
  isSystemAdmin(userId: string): boolean {
    return this.controllers.Jobs.isSystemAdmin(userId);
  }
  getStoreFounder(storeId: string): string {
    return this.controllers.Stores.getStoreFounderId(storeId);
  }
  getStoreOwners(storeId: string): string[] {
    return this.controllers.Stores.getStoreOwnersIds(storeId);
  }
  getStoreManagers(storeId: string): string[] {
    return this.controllers.Stores.getStoreManagersIds(storeId);
  }
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    this.validateConnection(userId);
    return this.controllers.Stores.createProduct(userId, storeId, product);
  }
  isStoreActive(userId: string, storeId: string): boolean {
    return this.controllers.Stores.isStoreActive(userId, storeId);
  }
  getStoreProducts(userId: string, storeId: string): StoreProductDTO[] {
    return this.controllers.Stores.getStoreProducts(userId, storeId);
  }
  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    this.validateConnection(userId);
    this.controllers.Stores.setProductQuantity(userId, productId, quantity);
  }
  decreaseProductQuantity(productId: string, quantity: number): void {
    this.controllers.Stores.decreaseProductQuantity(productId, quantity);
  }
  deleteProduct(userId: string, productId: string): void {
    this.validateConnection(userId);
    this.controllers.Stores.deleteProduct(userId, productId);
  }
  setProductPrice(userId: string, productId: string, price: number): void {
    this.validateConnection(userId);
    this.controllers.Stores.setProductPrice(userId, productId, price);
  }

  createStore(founderId: string, storeName: string): string {
    this.validateConnection(founderId);
    return this.controllers.Stores.createStore(founderId, storeName);
  }
  activateStore(userId: string, storeId: string): void {
    this.validateConnection(userId);
    this.controllers.Stores.activateStore(userId, storeId);
  }
  deactivateStore(userId: string, storeId: string): void {
    this.validateConnection(userId);
    this.controllers.Stores.deactivateStore(userId, storeId);
  }
  closeStorePermanently(userId: string, storeId: string): void {
    this.validateConnection(userId);
    this.controllers.Stores.closeStorePermanently(userId, storeId);
  }
  getProductPrice(userId: string, productId: string): number {
    return this.controllers.Stores.getProductPrice(userId, productId);
  }
  getProductById(userId: string, productId: string): StoreProductDTO {
    return this.controllers.Stores.getProductById(userId, productId);
  }
  isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): boolean {
    return this.controllers.Stores.isProductQuantityInStock(
      userId,
      productId,
      quantity
    );
  }
  getStoreIdByProductId(userId: string, productId: string): string {
    return this.controllers.Stores.getStoreIdByProductId(userId, productId);
  }
  getCartPrice(userId: string): number {
    return this.controllers.Stores.getCartPrice(userId);
  }
  getBasketPrice(userId: string, storeId: string): number {
    return this.controllers.Stores.getBasketPrice(userId, storeId);
  }
  searchProducts(userId: string, searchArgs: SearchArgs): StoreProductDTO[] {
    return this.controllers.Stores.searchProducts(userId, searchArgs);
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
  public getPurchasesByStore(
    userId: string,
    storeId: string
  ): BasketPurchaseDTO[] {
    return this.controllers.Stores.getPurchasesByStoreId(userId, storeId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged in members ids.
   * @returns Array of strings.
   */
  getAllLoggedInMembersIds(userId: string): string[] {
    this.validateConnection(userId);
    return this.controllers.Auth.getAllLoggedInMembersIds();
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  getAllLoggedOutMembersIds(userId: string): string[] {
    this.validateConnection(userId);
    return this.controllers.Auth.getAllLoggedOutMembersIds();
  }
  searchStores(userId: string, storeName: string): StoreDTO[] {
    this.validateConnection(userId);
    return this.controllers.Stores.searchStores(userId, storeName);
  }
  addDiscountToStore(
    userId: string,
    storeId: string,
    discount: DiscountArgs
  ): string {
    this.validateConnection(userId);
    return this.controllers.Stores.addDiscountToStore(
      userId,
      storeId,
      discount
    );
  }
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): void {
    this.validateConnection(userId);
    this.controllers.Stores.removeDiscountFromStore(
      userId,
      storeId,
      discountId
    );
  }
  addConstraintToStore(
    userId: string,
    storeId: string,
    constraint: ConditionArgs
  ): string {
    this.validateConnection(userId);
    return this.controllers.Stores.addConstraintToStore(
      userId,
      storeId,
      constraint
    );
  }
  removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): void {
    this.validateConnection(userId);
    this.controllers.Stores.removeConstraintFromStore(
      userId,
      storeId,
      constraintId
    );
  }
  myStores(userId: string): { store: StoreDTO; role: RoleType }[] {
    this.validateConnection(userId);
    return this.controllers.Stores.myStores(userId);
  }
  addBid(bid: BidArgs) {
    this.validateConnection(bid.userId);
    this.controllers.Users.addBid(bid);
  }
}
