import { type Controllers } from "./HasController";
import { CartDTO } from "./Users/Cart";
import { createControllers } from "./createControllers";
import { type StoreDTO } from "./Stores/Store";
import { type UserDTO } from "./Users/User";
import { type BasketDTO } from "./Users/Basket";
import {
  StoreProduct,
  type StoreProductDTO,
  type StoreProductArgs,
} from "./Stores/StoreProduct";
export type SearchArgs = {
  name?: string;
  category?: string;
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  minProductRating?: number;
  maxProductRating?: number;
  minStoreRating?: number;
  maxStoreRating?: number;
};
export class MarketFacade {
  private controllers: Controllers;

  constructor() {
    this.controllers = createControllers();
  }
  private isConnectionValid(userId: string): void {
    if (!this.controllers.Auth.isConnected(userId))
      throw new Error("User is not logged in");
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
  public purchaseCart(userId: string, cart: CartDTO) {
    this.isConnectionValid(userId);
    this.controllers.Users.purchaseCart(userId);
  }
  public addUser(userId: string, userName: string) {
    this.controllers.Users.addUser(userId, userName);
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

  login(email: string, password: string): string {
    return this.controllers.Auth.login(email, password);
  }

  logout(userId: string): void {
    this.controllers.Auth.logout(userId);
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

  getStoresByOwner(userId: string): StoreDTO[] {
    return this.controllers.Jobs.getStoresByOwner(userId);
  }
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.controllers.Jobs.makeStoreManager(currentId, storeId, targetUserId);
  }
  getStoresByManager(userId: string): StoreDTO[] {
    return this.controllers.Jobs.getStoresByManager(userId);
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
  canCreateProductInStore(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): boolean {
    return this.controllers.Jobs.canCreateProductInStore(
      currentId,
      storeId,
      targetUserId
    );
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
  getStoreFounder(storeId: string): UserDTO {
    return this.controllers.Jobs.getStoreFounder(storeId);
  }
  getStoreOwners(storeId: string): UserDTO[] {
    return this.controllers.Jobs.getStoreOwners(storeId);
  }
  getStoreManagers(storeId: string): UserDTO[] {
    return this.controllers.Jobs.getStoreManagers(storeId);
  }
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
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
    this.controllers.Stores.setProductQuantity(userId, productId, quantity);
  }
  decreaseProductQuantity(productId: string, quantity: number): void {
    this.controllers.Stores.decreaseProductQuantity(productId, quantity);
  }
  deleteProduct(userId: string, productId: string): void {
    this.controllers.Stores.deleteProduct(userId, productId);
  }
  setProductPrice(userId: string, productId: string, price: number): void {
    this.controllers.Stores.setProductPrice(userId, productId, price);
  }

  createStore(founderId: string, storeName: string): string {
    return this.controllers.Stores.createStore(founderId, storeName);
  }
  activateStore(userId: string, storeId: string): void {
    this.controllers.Stores.activateStore(userId, storeId);
  }
  deactivateStore(userId: string, storeId: string): void {
    this.controllers.Stores.deactivateStore(userId, storeId);
  }
  closeStorePermanently(userId: string, storeId: string): void {
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
}
