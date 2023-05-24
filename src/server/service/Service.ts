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
import { type StoreDTO } from "server/domain/Stores/Store";
import { type RoleType } from "server/domain/Jobs/Role";
import { type PositionHolderDTO } from "server/domain/Jobs/PositionHolder";
import { type ICondition } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import { type IDiscount } from "server/domain/Stores/DiscountPolicy/Discount";

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

  public async getLogs(userId: string) {
    return await this.facade.getLogs(userId);
  }

  public async getErrors(userId: string) {
    return await this.facade.getErrors(userId);
  }

  public async addProductToCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    await this.facade.addProductToCart(userId, productId, quantity);
  }
  public async removeProductFromCart(userId: string, productId: string) {
    await this.facade.removeProductFromCart(userId, productId);
  }
  public async editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    await this.facade.editProductQuantityInCart(userId, productId, quantity);
  }
  public getCart(userId: string) {
    return this.facade.getCart(userId);
  }
  public getNotifications(userId: string) {
    return this.facade.getNotifications(userId);
  }
  public purchaseCart(userId: string, creditCard: CreditCard) {
    return this.facade.purchaseCart(userId, creditCard);
  }
  public async removeUser(userId: string) {
    await this.facade.removeUser(userId);
  }
  public async readNotification(userId: string, notificationId: string) {
    await this.facade.readNotification(userId, notificationId);
  }
  public async addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ) {
    await this.facade.addNotification(
      userId,
      notificationType,
      notificationMsg
    );
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
    reviewDescription: string,
    storeId: string
  ) {
    this.facade.reviewProduct(
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
    return this.facade.getStoreRating(storeId);
  }

  public async loginMember(
    userId: string,
    email: string,
    password: string
  ): Promise<string> {
    return await this.facade.loginMember(userId, email, password);
  }

  public async disconnectUser(userId: string) {
    await this.facade.disconnectUser(userId);
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
  async makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    await this.facade.makeStoreOwner(currentId, storeId, targetUserId);
  }

  async makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    await this.facade.makeStoreManager(currentId, storeId, targetUserId);
  }

  async removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    await this.facade.removeStoreOwner(currentId, storeId, targetUserId);
  }

  async getMyPurchaseHistory(userId: string): Promise<CartPurchaseDTO[]> {
    return await this.facade.getMyPurchaseHistory(userId);
  }

  async removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    await this.facade.removeStoreManager(currentId, storeId, targetUserId);
  }
  async setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    await this.facade.setAddingProductToStorePermission(
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
    return await this.facade.canCreateProductInStore(currentId, storeId);
  }
  async canEditProductInStore(
    currentId: string,
    storeId: string
  ): Promise<boolean> {
    return await this.facade.canEditProductInStore(currentId, storeId);
  }
  async isStoreOwner(userId: string, storeId: string): Promise<boolean> {
    return await this.facade.isStoreOwner(userId, storeId);
  }
  async isStoreManager(userId: string, storeId: string): Promise<boolean> {
    return await this.facade.isStoreManager(userId, storeId);
  }
  async isSystemAdmin(userId: string): Promise<boolean> {
    return await this.facade.isSystemAdmin(userId);
  }
  async getStoreFounder(storeId: string): Promise<string> {
    return await this.facade.getStoreFounder(storeId);
  }
  async getStoreOwners(storeId: string): Promise<string[]> {
    return await this.facade.getStoreOwners(storeId);
  }
  async getStoreManagers(storeId: string): Promise<string[]> {
    return await this.facade.getStoreManagers(storeId);
  }
  async createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): Promise<string> {
    return await this.facade.createProduct(userId, storeId, product);
  }
  async isStoreActive(userId: string, storeId: string): Promise<boolean> {
    return await this.facade.isStoreActive(userId, storeId);
  }
  async setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    await this.facade.setProductQuantity(userId, productId, quantity);
  }
  async decreaseProductQuantity(
    productId: string,
    quantity: number
  ): Promise<void> {
    await this.facade.decreaseProductQuantity(productId, quantity);
  }
  async deleteProduct(userId: string, productId: string): Promise<void> {
    await this.facade.deleteProduct(userId, productId);
  }
  async setProductPrice(
    userId: string,
    productId: string,
    price: number
  ): Promise<void> {
    await this.facade.setProductPrice(userId, productId, price);
  }

  async activateStore(userId: string, storeId: string): Promise<void> {
    await this.facade.activateStore(userId, storeId);
  }
  async deactivateStore(userId: string, storeId: string): Promise<void> {
    await this.facade.deactivateStore(userId, storeId);
  }
  async closeStorePermanently(userId: string, storeId: string): Promise<void> {
    await this.facade.closeStorePermanently(userId, storeId);
  }
  async getProductPrice(userId: string, productId: string): Promise<number> {
    return await this.facade.getProductPrice(userId, productId);
  }
  async isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    return await this.facade.isProductQuantityInStock(
      userId,
      productId,
      quantity
    );
  }
  async getStoreIdByProductId(
    userId: string,
    productId: string
  ): Promise<string> {
    return await this.facade.getStoreIdByProductId(userId, productId);
  }
  async getCartPrice(userId: string): Promise<number> {
    return await this.facade.getCartPrice(userId);
  }
  async getBasketPrice(userId: string, storeId: string): Promise<number> {
    return await this.facade.getBasketPrice(userId, storeId);
  }
  async searchProducts(
    userId: string,
    searchArgs: SearchArgs
  ): Promise<StoreProductDTO[]> {
    return await this.facade.searchProducts(userId, searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public async startSession(): Promise<string> {
    return await this.facade.startSession();
  }

  public async registerMember(
    userId: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.facade.registerMember(userId, email, password);
  }

  public async logoutMember(userId: string): Promise<string> {
    return await this.facade.logoutMember(userId);
  }
  public async getPurchasesByUser(
    adminId: string,
    userId: string
  ): Promise<CartPurchaseDTO[]> {
    return await this.facade.getPurchasesByUser(adminId, userId);
  }
  public async getPurchasesByStore(
    userId: string,
    storeId: string
  ): Promise<BasketPurchaseDTO[]> {
    return await this.facade.getPurchasesByStore(userId, storeId);
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
  async removeMember(userIdOfActor: string, memberIdToRemove: string) {
    await this.facade.removeMember(userIdOfActor, memberIdToRemove);
  }
  async getProductById(
    userId: string,
    productId: string
  ): Promise<StoreProductDTO> {
    return await this.facade.getProductById(userId, productId);
  }
  async myStores(
    userId: string
  ): Promise<{ store: StoreDTO; role: RoleType }[]> {
    return await this.facade.myStores(userId);
  }
  async searchStores(userId: string, storeName: string): Promise<StoreDTO[]> {
    return await this.facade.searchStores(userId, storeName);
  }
  async getJobsHierarchyOfStore(
    userId: string,
    storeId: string
  ): Promise<PositionHolderDTO> {
    return await this.facade.getJobsHierarchyOfStore(userId, storeId);
  }
  // getStoreConstraints(
  //   userId: string,
  //   storeId: string
  // ): Map<string, ICondition> {
  //   return this.facade.getStoreConstraints(userId, storeId);
  // }
  // getStoreDiscounts(userId: string, storeId: string): Map<string, IDiscount> {
  //   return this.facade.getStoreDiscounts(userId, storeId);
  // }
}
