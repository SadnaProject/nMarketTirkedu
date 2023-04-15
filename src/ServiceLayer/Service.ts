import { MarketFacade } from "../DomainLayer/MarketFacade";
import { type CartDTO } from "../DomainLayer/Users/Cart";
import { type StoreDTO } from "../DomainLayer/Stores/Store";
import { type UserDTO } from "../DomainLayer/Users/User";
import { type BasketDTO } from "../DomainLayer/Users/Basket";
import {
  type StoreProductDTO,
  type StoreProductArgs,
} from "../DomainLayer/Stores/StoreProduct";
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
  public purchaseCart(userId: string, creditCard: string) {
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

  public register(email: string, password: string) {
    this.facade.register(email, password);
  }

  public loginMember(userId: string, email: string, password: string): string {
    return this.facade.loginMember(userId, email, password);
  }

  public disconnectUser(userId: string) {
    this.facade.disconnectUser(userId);
  }

  public getStoreProducts(storeId: string) {
    return this.facade.getStoreProducts(storeId);
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
  isMember(userId: string): boolean {
    return this.facade.isMember(userId);
  }

  isConnected(userId: string): boolean {
    return this.facade.isConnected(userId);
  }

  changeEmail(userId: string, newEmail: string): void {
    this.facade.changeEmail(userId, newEmail);
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): void {
    this.facade.changePassword(userId, oldPassword, newPassword);
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
    this.facade.removeStoreManager(currentId, storeId, targetUserId);
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
  isStoreActive(storeId: string): boolean {
    return this.facade.isStoreActive(storeId);
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
  getProductPrice(productId: string): number {
    return this.facade.getProductPrice(productId);
  }
  isProductQuantityInStock(productId: string, quantity: number): boolean {
    return this.facade.isProductQuantityInStock(productId, quantity);
  }
  getStoreIdByProductId(productId: string): string {
    return this.facade.getStoreIdByProductId(productId);
  }
  getCartPrice(cartDTO: CartDTO): number {
    return this.facade.getCartPrice(cartDTO);
  }
  getBasketPrice(basketDTO: BasketDTO): number {
    return this.facade.getBasketPrice(basketDTO);
  }
  searchProducts(searchArgs: SearchArgs): StoreProductDTO[] {
    return this.facade.searchProducts(searchArgs);
  }
  //TODO: Duplicate code from down here, be careful!
  public startSession(): string {
    return this.facade.startSession();
  }

  public registerMember(userId: string, email: string, password: string): void {
    this.facade.registerMember(userId, email, password);
  }
}
