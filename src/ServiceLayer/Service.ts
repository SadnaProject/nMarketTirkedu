import { MarketFacade } from "../DomainLayer/MarketFacade";
import { type CartDTO } from "../DomainLayer/Users/Cart";

export class Service {
  private facade: MarketFacade;

  constructor() {
    this.facade = new MarketFacade();
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
  public purchaseCart(userId: string, cart: CartDTO) {
    this.facade.purchaseCart(userId, cart);
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
}
