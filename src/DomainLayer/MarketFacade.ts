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
    this.initializeSystemAdmin();
  }
  private initializeSystemAdmin() {
    this.controllers.Auth.register("admin", "admin");
    this.controllers.Jobs.setInitialAdmin("admin");
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
  //TODO: Duplicate code from down here, be careful!
  public startSession(): string {
    const userId = this.controllers.Auth.startSession();
    this.addUser(userId, "Guest");
    return userId;
  }
  private addUser(userId: string, userName: string) {
    this.controllers.Users.addUser(userId, userName);
  }
  public registerMember(userId: string, email: string, password: string): void {
    this.isConnectionValid(userId);
    this.controllers.Auth.register(email, password);
  }
  public loginMember(userId: string, email: string, password: string): string {
    this.isConnectionValid(userId);
    return this.controllers.Auth.login(userId, email, password);
  }
  public logoutMember(userId: string): string {
    this.isConnectionValid(userId); 
    return this.controllers.Auth.logout(userId);
  }
  //This is not called logout because it also disconnects guest users which were not logged in.
  //disconnects a user. if the user is a guest user, the user is removed from the system.
  //if the user is a member user, the users session is invalidated.
  public disconnectUser(userId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Auth.disconnect(userId);
  }
}
