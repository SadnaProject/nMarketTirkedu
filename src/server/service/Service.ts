import { MarketFacade } from "server/domain/MarketFacade";
import { type BasketPurchaseDTO } from "server/domain/PurchasesHistory/BasketPurchaseHistory";
import { type CartPurchaseDTO } from "server/domain/PurchasesHistory/CartPurchaseHistory";
import {
  type StoreProductArgs,
  type StoreProductDTO,
} from "server/domain/Stores/StoreProduct";
import { type BasketDTO } from "server/domain/Users/Basket";
import { type CartDTO } from "server/domain/Users/Cart";
import { type CreditCard } from "server/domain/PurchasesHistory/PaymentAdaptor";

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
export class Service {
  private facade: MarketFacade;

  constructor() {
    this.facade = new MarketFacade();
  }

  public getLogs(userId: string) {
    return this.facade.getLogs(userId);
  }

  public getErrors(userId: string) {
    return this.facade.getErrors(userId);
  }

  public addProductToCart(userId: string, productId: string, quantity: number) {
    this.facade.addProductToCart(userId, productId, quantity);
  }
  public removeProductFromCart(userId: string, productId: string) {
    this.facade.removeProductFromCart(userId, productId);
  }
  public editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.facade.editProductQuantityInCart(userId, productId, quantity);
  }
  public getCart(userId: string) {
    return this.facade.getCart(userId);
  }
  public getNotifications(userId: string) {
    return this.facade.getNotifications(userId);
  }
  public purchaseCart(userId: string, creditCard: CreditCard) {
    this.facade.purchaseCart(userId, creditCard);
  }
  public removeUser(userId: string) {
    this.facade.removeUser(userId);
  }
  public readNotification(userId: string, notificationId: string) {
    this.facade.readNotification(userId, notificationId);
  }
  public addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ) {
    this.facade.addNotification(userId, notificationType, notificationMsg);
  }
  public getUnreadNotifications(userId: string) {
    return this.facade.getUnreadNotifications(userId);
  }
  public reviewStore(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ) {
    this.facade.reviewStore(userId, purchaseId, storeId, review);
  }

  public reviewProduct(
    userId: string,
    purchaseId: string,
    productId: string,
    review: number,
    reviewTitle: string,
    reviewDescription: string
  ) {
    this.facade.reviewProduct(
      userId,
      purchaseId,
      productId,
      review,
      reviewTitle,
      reviewDescription
    );
  }

  public getStoreRating(storeId: string) {
    return this.facade.getStoreRating(storeId);
  }

  public loginMember(userId: string, email: string, password: string): string {
    return this.facade.loginMember(userId, email, password);
  }

  public disconnectUser(userId: string) {
    this.facade.disconnectUser(userId);
  }

  public getStoreProducts(userId: string, storeId: string) {
    return this.facade.getStoreProducts(userId, storeId);
  }

  public createStore(founderId: string, storeName: string) {
    return this.facade.createStore(founderId, storeName);
  }

  public isStoreFounder(userId: string, storeId: string) {
    return this.facade.isStoreFounder(userId, storeId);
  }

  isGuest(userId: string): boolean {
    return this.facade.isGuest(userId);
  }
  async isMember(userId: string): Promise<boolean> {
    return this.facade.isMember(userId);
  }

  async isConnected(userId: string): Promise<boolean> {
    return this.facade.isConnected(userId);
  }

  async changeEmail(userId: string, newEmail: string): Promise<void> {
    await this.facade.changeEmail(userId, newEmail);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.facade.changePassword(userId, oldPassword, newPassword);
  }
  makeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    this.facade.makeStoreOwner(currentId, storeId, targetUserId);
  }

  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.facade.makeStoreManager(currentId, storeId, targetUserId);
  }

  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.facade.removeStoreOwner(currentId, storeId, targetUserId);
  }

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void {
    this.facade.removeStoreManager(currentId, storeId, targetUserId);
  }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void {
    this.facade.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  canCreateProductInStore(currentId: string, storeId: string): boolean {
    return this.facade.canCreateProductInStore(currentId, storeId);
  }
  canEditProductInStore(currentId: string, storeId: string): boolean {
    return this.facade.canEditProductInStore(currentId, storeId);
  }
  isStoreOwner(userId: string, storeId: string): boolean {
    return this.facade.isStoreOwner(userId, storeId);
  }
  isStoreManager(userId: string, storeId: string): boolean {
    return this.facade.isStoreManager(userId, storeId);
  }
  isSystemAdmin(userId: string): boolean {
    return this.facade.isSystemAdmin(userId);
  }
  getStoreFounder(storeId: string): string {
    return this.facade.getStoreFounder(storeId);
  }
  getStoreOwners(storeId: string): string[] {
    return this.facade.getStoreOwners(storeId);
  }
  getStoreManagers(storeId: string): string[] {
    return this.facade.getStoreManagers(storeId);
  }
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    return this.facade.createProduct(userId, storeId, product);
  }
  isStoreActive(userId: string, storeId: string): boolean {
    return this.facade.isStoreActive(userId, storeId);
  }
  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    this.facade.setProductQuantity(userId, productId, quantity);
  }
  decreaseProductQuantity(productId: string, quantity: number): void {
    this.facade.decreaseProductQuantity(productId, quantity);
  }
  deleteProduct(userId: string, productId: string): void {
    this.facade.deleteProduct(userId, productId);
  }
  setProductPrice(userId: string, productId: string, price: number): void {
    this.facade.setProductPrice(userId, productId, price);
  }

  activateStore(userId: string, storeId: string): void {
    this.facade.activateStore(userId, storeId);
  }
  deactivateStore(userId: string, storeId: string): void {
    this.facade.deactivateStore(userId, storeId);
  }
  closeStorePermanently(userId: string, storeId: string): void {
    this.facade.closeStorePermanently(userId, storeId);
  }
  getProductPrice(userId: string, productId: string): number {
    return this.facade.getProductPrice(userId, productId);
  }
  isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): boolean {
    return this.facade.isProductQuantityInStock(userId, productId, quantity);
  }
  getStoreIdByProductId(userId: string, productId: string): string {
    return this.facade.getStoreIdByProductId(userId, productId);
  }
  getCartPrice(userId: string): number {
    return this.facade.getCartPrice(userId);
  }
  getBasketPrice(userId: string, storeId: string): number {
    return this.facade.getBasketPrice(userId, storeId);
  }
  searchProducts(userId: string, searchArgs: SearchArgs): StoreProductDTO[] {
    return this.facade.searchProducts(userId, searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public startSession(): string {
    return this.facade.startSession();
  }

  public registerMember(userId: string, email: string, password: string): void {
    this.facade.registerMember(userId, email, password);
  }

  public logoutMember(userId: string): string {
    return this.facade.logoutMember(userId);
  }
  public getPurchasesByUser(
    adminId: string,
    userId: string
  ): CartPurchaseDTO[] {
    return this.facade.getPurchasesByUser(adminId, userId);
  }
  public getPurchasesByStore(
    userId: string,
    storeId: string
  ): BasketPurchaseDTO[] {
    return this.facade.getPurchasesByStore(userId, storeId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged in members ids.
   * @returns Array of strings.
   */
  async getAllLoggedInMembersIds(userId: string): Promise<string[]> {
    return this.facade.getAllLoggedInMembersIds(userId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  async getAllLoggedOutMembersIds(userId: string): Promise<string[]> {
    return this.facade.getAllLoggedOutMembersIds(userId);
  }
  removeMember(userIdOfActor: string, memberIdToRemove: string) {
    this.facade.removeMember(userIdOfActor, memberIdToRemove);
  }
}
