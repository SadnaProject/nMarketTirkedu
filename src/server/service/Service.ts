import { MarketFacade } from "server/domain/MarketFacade";
import { type BasketPurchaseDTO } from "server/domain/PurchasesHistory/BasketPurchaseHistory";
import { type CartPurchaseDTO } from "server/domain/PurchasesHistory/CartPurchaseHistory";
import {
  type StoreProductArgs,
  type StoreProductDTO,
} from "server/domain/Stores/StoreProduct";
import { type PaymentDetails } from "server/domain/PurchasesHistory/PaymentAdaptor";
import { type StoreDTO } from "server/domain/Stores/Store";
import { type Permission, type RoleType } from "server/domain/Jobs/Role";
import { type PositionHolderDTO } from "server/domain/Jobs/PositionHolder";
import { type ICondition } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import {
  type DiscountArgs,
  type IDiscount,
} from "server/domain/Stores/DiscountPolicy/Discount";
import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import { type BidDTO, type BidArgs } from "server/domain/Users/Bid";
import { type MakeOwnerDTO } from "server/domain/Stores/MakeOwner";

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
    return this.facade.addProductToCart(userId, productId, quantity);
  }
  public removeProductFromCart(userId: string, productId: string) {
    return this.facade.removeProductFromCart(userId, productId);
  }
  public editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    return this.facade.editProductQuantityInCart(userId, productId, quantity);
  }
  public getCart(userId: string) {
    return this.facade.getCart(userId);
  }
  public getCartUI(userId: string) {
    return this.facade.getCartUI(userId);
  }
  public getNotifications(userId: string) {
    return this.facade.getNotifications(userId);
  }
  public purchaseCart(
    userId: string,
    creditCard: PaymentDetails,
    delivery: {
      address: string;
      city: string;
      country: string;
      name: string;
      zip: string;
    }
  ) {
    return this.facade.purchaseCart(userId, creditCard, delivery);
  }
  public removeUser(userId: string) {
    return this.facade.removeUser(userId);
  }
  public readNotification(userId: string, notificationId: string) {
    return this.facade.readNotification(userId, notificationId);
  }
  public addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string,
    isOnline: boolean
  ) {
    return this.facade.addNotification(
      userId,
      notificationType,
      notificationMsg,
      isOnline
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
    return this.facade.reviewStore(userId, purchaseId, storeId, review);
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
    return this.facade.reviewProduct(
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

  public loginMember(
    userId: string,
    email: string,
    password: string
  ): Promise<string> {
    return this.facade.loginMember(userId, email, password);
  }

  public disconnectUser(userId: string) {
    return this.facade.disconnectUser(userId);
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
  isMember(userId: string): Promise<boolean> {
    return this.facade.isMember(userId);
  }

  isConnected(userId: string): Promise<boolean> {
    return this.facade.isConnected(userId);
  }

  changeEmail(userId: string, newEmail: string): Promise<void> {
    return this.facade.changeEmail(userId, newEmail);
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    return this.facade.changePassword(userId, oldPassword, newPassword);
  }
  makeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    return this.facade.makeStoreOwner(currentId, storeId, targetUserId);
  }

  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    return this.facade.makeStoreManager(currentId, storeId, targetUserId);
  }

  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    return this.facade.removeStoreOwner(currentId, storeId, targetUserId);
  }

  getMyPurchaseHistory(userId: string): Promise<CartPurchaseDTO[]> {
    return this.facade.getMyPurchaseHistory(userId);
  }

  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void> {
    return this.facade.removeStoreManager(currentId, storeId, targetUserId);
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
  async setRemovingProductFromStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void> {
    await this.facade.setRemovingProductFromStorePermission(
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
    await this.facade.setEditingProductInStorePermission(
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
    await this.facade.setModifyingPurchasePolicyPermission(
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
    await this.facade.setReceivingPrivateStoreDataPermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  canCreateProductInStore(
    currentId: string,
    storeId: string
  ): Promise<boolean> {
    return this.facade.canCreateProductInStore(currentId, storeId);
  }
  canEditProductInStore(currentId: string, storeId: string): Promise<boolean> {
    return this.facade.canEditProductInStore(currentId, storeId);
  }
  isStoreOwner(userId: string, storeId: string): Promise<boolean> {
    return this.facade.isStoreOwner(userId, storeId);
  }
  isStoreManager(userId: string, storeId: string): Promise<boolean> {
    return this.facade.isStoreManager(userId, storeId);
  }
  isSystemAdmin(userId: string): Promise<boolean> {
    return this.facade.isSystemAdmin(userId);
  }
  getStoreFounder(storeId: string): Promise<string> {
    return this.facade.getStoreFounder(storeId);
  }
  getStoreOwners(storeId: string): Promise<string[]> {
    return this.facade.getStoreOwners(storeId);
  }
  getStoreManagers(storeId: string): Promise<string[]> {
    return this.facade.getStoreManagers(storeId);
  }
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): Promise<string> {
    return this.facade.createProduct(userId, storeId, product);
  }
  isStoreActive(userId: string, storeId: string): Promise<boolean> {
    return this.facade.isStoreActive(userId, storeId);
  }
  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    return this.facade.setProductQuantity(userId, productId, quantity);
  }
  decreaseProductQuantity(productId: string, quantity: number): Promise<void> {
    return this.facade.decreaseProductQuantity(productId, quantity);
  }
  deleteProduct(userId: string, productId: string): Promise<void> {
    return this.facade.deleteProduct(userId, productId);
  }
  setProductPrice(
    userId: string,
    productId: string,
    price: number
  ): Promise<void> {
    return this.facade.setProductPrice(userId, productId, price);
  }

  activateStore(userId: string, storeId: string): Promise<void> {
    return this.facade.activateStore(userId, storeId);
  }
  deactivateStore(userId: string, storeId: string): Promise<void> {
    return this.facade.deactivateStore(userId, storeId);
  }
  closeStorePermanently(userId: string, storeId: string): Promise<void> {
    return this.facade.closeStorePermanently(userId, storeId);
  }
  getProductPrice(userId: string, productId: string): Promise<number> {
    return this.facade.getProductPrice(userId, productId);
  }
  isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    return this.facade.isProductQuantityInStock(userId, productId, quantity);
  }
  getStoreIdByProductId(userId: string, productId: string): Promise<string> {
    return this.facade.getStoreIdByProductId(userId, productId);
  }
  getCartPrice(userId: string): Promise<number> {
    return this.facade.getCartPrice(userId);
  }
  getBasketPrice(userId: string, storeId: string): Promise<number> {
    return this.facade.getBasketPrice(userId, storeId);
  }
  searchProducts(
    userId: string,
    searchArgs: SearchArgs
  ): Promise<StoreProductDTO[]> {
    return this.facade.searchProducts(userId, searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public startSession(): Promise<string> {
    return this.facade.startSession();
  }

  public registerMember(
    userId: string,
    email: string,
    password: string
  ): Promise<string> {
    return this.facade.registerMember(userId, email, password);
  }

  public logoutMember(userId: string): Promise<string> {
    return this.facade.logoutMember(userId);
  }
  public getPurchase(purchaseId: string): Promise<CartPurchaseDTO> {
    return this.facade.getPurchase(purchaseId);
  }
  public getPurchasesByUser(
    adminId: string,
    userId: string
  ): Promise<CartPurchaseDTO[]> {
    return this.facade.getPurchasesByUser(adminId, userId);
  }
  public getPurchasesByStore(
    userId: string,
    storeId: string
  ): Promise<BasketPurchaseDTO[]> {
    return this.facade.getPurchasesByStore(userId, storeId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged in members ids.
   * @returns Array of strings.
   */
  getAllLoggedInMembersIds(userId: string): Promise<string[]> {
    return this.facade.getAllLoggedInMembersIds(userId);
  }
  // eslint-disable-next-line jsdoc/require-param
  /**
   * Returns all the logged out members ids.
   * @returns Array of strings.
   */
  getAllLoggedOutMembersIds(userId: string): Promise<string[]> {
    return this.facade.getAllLoggedOutMembersIds(userId);
  }
  removeMember(userIdOfActor: string, memberIdToRemove: string) {
    return this.facade.removeMember(userIdOfActor, memberIdToRemove);
  }
  getProductById(userId: string, productId: string): Promise<StoreProductDTO> {
    return this.facade.getProductById(userId, productId);
  }
  myStores(userId: string): Promise<{ store: StoreDTO; role: RoleType }[]> {
    return this.facade.myStores(userId);
  }
  searchStores(userId: string, storeName: string): Promise<StoreDTO[]> {
    return this.facade.searchStores(userId, storeName);
  }
  getJobsHierarchyOfStore(
    userId: string,
    storeId: string
  ): Promise<PositionHolderDTO> {
    return this.facade.getJobsHierarchyOfStore(userId, storeId);
  }
  reConnectMember(userId: string): Promise<void> {
    return this.facade.reConnectMember(userId);
  }
  getMemberIdByEmail(email: string): Promise<string> {
    return this.facade.getMemberIdByEmail(email);
  }
  getStoreConstraints(userId: string, storeId: string) {
    return this.facade.getStoreConstraints(userId, storeId);
  }
  getStoreDiscounts(userId: string, storeId: string) {
    return this.facade.getStoreDiscounts(userId, storeId);
  }
  getStoreNameById(userId: string, storeId: string): Promise<string> {
    return this.facade.getStoreNameById(userId, storeId);
  }
  async getPermissionsOfUser(
    userId: string,
    storeId: string
  ): Promise<Permission[]> {
    return await this.facade.getPermissionsOfUser(userId, storeId);
  }
  async addConstraintToStore(
    userId: string,
    storeId: string,
    constraint: ConditionArgs
  ): Promise<string> {
    return await this.facade.addConstraintToStore(userId, storeId, constraint);
  }
  async removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): Promise<void> {
    await this.facade.removeConstraintFromStore(userId, storeId, constraintId);
  }
  async initializeAdmin() {
    return await this.facade.initializeSystemAdmin();
  }
  async addDiscountToStore(
    userId: string,
    storeId: string,
    discount: DiscountArgs
  ): Promise<string> {
    return await this.facade.addDiscountToStore(userId, storeId, discount);
  }
  async removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): Promise<void> {
    await this.facade.removeDiscountFromStore(userId, storeId, discountId);
  }
  async addBid(bid: BidArgs) {
    return await this.facade.addBid(bid);
  }
  async counterBid(userId: string, bidId: string, price: number) {
    return await this.facade.counterBid(userId, bidId, price);
  }
  async getBidsFromMe(userId: string): Promise<BidDTO[]> {
    return await this.facade.getBidsFromMe(userId);
  }
  async getBidsToMe(userId: string): Promise<BidDTO[]> {
    return await this.facade.getBidsToMe(userId);
  }
  async approveBid(userId: string, bidId: string): Promise<string> {
    return await this.facade.approveBid(userId, bidId);
  }
  async rejectBid(userId: string, bidId: string): Promise<void> {
    await this.facade.rejectBid(userId, bidId);
  }
  async subscribeToStoreEvents(userId: string) {
    await this.facade.subscribeToStoreEvents(userId);
  }
  async approveStoreOwner(makeOwnerObjectId: string, approverId: string) {
    await this.facade.approveStoreOwner(makeOwnerObjectId, approverId);
  }
  async rejectStoreOwner(makeOwnerObjectId: string, approverId: string) {
    await this.facade.rejectStoreOwner(makeOwnerObjectId, approverId);
  }
  async getMakeOwnerRequests(userId: string): Promise<MakeOwnerDTO[]> {
    return await this.facade.getMakeOwnerRequests(userId);
  }
}
