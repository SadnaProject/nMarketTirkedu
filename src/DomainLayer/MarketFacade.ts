import { type Controllers } from "./HasController";
import { type CartDTO } from "./Users/Cart";
import { createControllers } from "./createControllers";
import { type BasketDTO } from "./Users/Basket";
import {
  type StoreProductDTO,
  type StoreProductArgs,
} from "./Stores/StoreProduct";
import { Loggable, loggable } from "./Loggable";
import { type SearchArgs } from "./Stores/StoresController";

@loggable
export class MarketFacade extends Loggable {
  private controllers: Controllers;

  constructor() {
    super();
    this.controllers = createControllers();
    this.initializeSystemAdmin();
  }
  private initializeSystemAdmin() {
    this.controllers.Auth.register("email", "admin");
    this.controllers.Jobs.setInitialAdmin("email");
  }

  private isConnectionValid(userId: string): void {
    if (!this.controllers.Auth.isConnected(userId))
      throw new Error("User is not logged in");
  }

  public getLogs(userId: string) {
    this.isConnectionValid(userId);
    if (this.isSystemAdmin(userId)) {
      return this.Logs;
    }
    throw new Error("User is not system admin");
  }

  public getErrors(userId: string) {
    this.isConnectionValid(userId);
    if (this.isSystemAdmin(userId)) {
      return this.Errors;
    }
    throw new Error("User is not system admin");
  }

  //Checking if user is logged in is done here.
  public addProductToCart(userId: string, productId: string, quantity: number) {
    this.isConnectionValid(userId);
    this.controllers.Users.addProductToCart(userId, productId, quantity);
  }
  public removeProductFromCart(userId: string, productId: string) {
    this.isConnectionValid(userId);
    this.controllers.Users.removeProductFromCart(userId, productId);
  }
  public editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.isConnectionValid(userId);
    this.controllers.Users.editProductQuantityInCart(
      userId,
      productId,
      quantity
    );
  }
  public getCart(userId: string) {
    this.isConnectionValid(userId);
    return this.controllers.Users.getCart(userId);
  }
  public getNotifications(userId: string) {
    this.isConnectionValid(userId);
    return this.controllers.Users.getNotifications(userId);
  }
  public purchaseCart(userId: string, cart: CartDTO, creditCard: string) {
    this.isConnectionValid(userId);
    this.controllers.Users.purchaseCart(userId, creditCard);
  }

  public removeUser(userId: string) {
    this.controllers.Users.removeUser(userId);
  }
  public readNotification(userId: string, notificationId: string) {
    this.isConnectionValid(userId);
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
    this.isConnectionValid(userId);
    return this.controllers.Users.getUnreadNotifications(userId);
  }
  public reviewStore(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ) {
    this.isConnectionValid(userId);
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
    this.isConnectionValid(userId);
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

  register(email: string, password: string): void {
    this.controllers.Auth.register(email, password);
  }

  changeEmail(userId: string, newEmail: string): void {
    this.controllers.Auth.changeEmail(userId, newEmail);
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): void {
    this.controllers.Auth.changePassword(userId, oldPassword, newPassword);
  }
  makeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    this.controllers.Jobs.makeStoreOwner(currentId, storeId, targetUserId);
  }

  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.controllers.Jobs.makeStoreManager(currentId, storeId, targetUserId);
  }

  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.controllers.Jobs.removeStoreManager(currentId, storeId, targetUserId);
  }

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.controllers.Jobs.removeStoreManager(currentId, storeId, targetUserId);
  }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.controllers.Jobs.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  canCreateProductInStore(currentId: string, storeId: string): boolean {
    return this.controllers.Jobs.canCreateProductInStore(currentId, storeId);
  }
  isStoreOwner(userId: string, storeId: string): boolean {
    return this.controllers.Jobs.isStoreOwner(userId, storeId);
  }
  isStoreManager(userId: string, storeId: string): boolean {
    return this.controllers.Jobs.isStoreManager(userId, storeId);
  }
  isStoreFounder(userId: string, storeId: string): boolean {
    return this.controllers.Jobs.isStoreFounder(userId, storeId);
  }
  isSystemAdmin(userId: string): boolean {
    return this.controllers.Jobs.isSystemAdmin(userId);
  }
  getStoreFounder(storeId: string): string {
    return this.controllers.Jobs.getStoreFounderId(storeId);
  }
  getStoreOwners(storeId: string): string[] {
    return this.controllers.Jobs.getStoreOwnersIds(storeId);
  }
  getStoreManagers(storeId: string): string[] {
    return this.controllers.Jobs.getStoreManagersIds(storeId);
  }
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    this.isConnectionValid(userId);
    return this.controllers.Stores.createProduct(userId, storeId, product);
  }
  isStoreActive(storeId: string): boolean {
    return this.controllers.Stores.isStoreActive(storeId);
  }
  getStoreProducts(storeId: string): StoreProductDTO[] {
    return this.controllers.Stores.getStoreProducts(storeId);
  }
  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.setProductQuantity(userId, productId, quantity);
  }
  decreaseProductQuantity(productId: string, quantity: number): void {
    this.controllers.Stores.decreaseProductQuantity(productId, quantity);
  }
  deleteProduct(userId: string, productId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.deleteProduct(userId, productId);
  }
  setProductPrice(userId: string, productId: string, price: number): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.setProductPrice(userId, productId, price);
  }

  createStore(founderId: string, storeName: string): string {
    this.isConnectionValid(founderId);
    return this.controllers.Stores.createStore(founderId, storeName);
  }
  activateStore(userId: string, storeId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.activateStore(userId, storeId);
  }
  deactivateStore(userId: string, storeId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.deactivateStore(userId, storeId);
  }
  closeStorePermanently(userId: string, storeId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Stores.closeStorePermanently(userId, storeId);
  }
  getProductPrice(productId: string): number {
    return this.controllers.Stores.getProductPrice(productId);
  }
  isProductQuantityInStock(productId: string, quantity: number): boolean {
    return this.controllers.Stores.isProductQuantityInStock(
      productId,
      quantity
    );
  }
  getStoreIdByProductId(productId: string): string {
    return this.controllers.Stores.getStoreIdByProductId(productId);
  }
  getCartPrice(cartDTO: CartDTO): number {
    return this.controllers.Stores.getCartPrice(cartDTO);
  }
  getBasketPrice(basketDTO: BasketDTO): number {
    return this.controllers.Stores.getBasketPrice(basketDTO);
  }
  searchProducts(searchArgs: SearchArgs): StoreProductDTO[] {
    return this.controllers.Stores.searchProducts(searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public startSession(): string {
    return this.controllers.Users.startSession();
  }
  public registerMember(userId: string, email: string, password: string): void {
    this.isConnectionValid(userId);
    this.controllers.Auth.register(email, password);
  }
  public loginMember(userId: string, email: string, password: string): string {
    this.isConnectionValid(userId);
    return this.controllers.Users.login(userId, email, password);
  }
  public logoutMember(userId: string): string {
    this.isConnectionValid(userId);
    return this.controllers.Users.logout(userId);
  }
  //This is not called logout because it also disconnects guest users which were not logged in.
  //disconnects a user. if the user is a guest user, the user is removed from the system.
  //if the user is a member user, the users session is invalidated.
  public disconnectUser(userId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Users.disconnect(userId);
  }
}
