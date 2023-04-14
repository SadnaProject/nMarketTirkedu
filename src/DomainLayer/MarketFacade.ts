import { type Controllers } from "./HasController";
import { CartDTO } from "./Users/Cart";
import { createControllers } from "./createControllers";

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
      reviewDescription,
    );
  }

  public getStoreRating(storeId: string) {
    return this.controllers.PurchasesHistory.getStoreRating(storeId);
  }
  public startSession() {
    const userId= this.controllers.Auth.startSession();
    this.addUser(userId, "Guest");

  }
  private addUser(userId: string, userName: string) {
    this.controllers.Users.addUser(userId, userName);
  }
  public registerMember(userId: string,email: string, password: string): void {
    this.isConnectionValid(userId);
    this.controllers.Auth.register( email, password);
  }
  public loginMember(userId: string, email: string, password: string): string {
    this.isConnectionValid(userId);
    return this.controllers.Auth.login(userId, email, password);
  }
  //This is not called logout because it also disconnects guest users which were not logged in.
  //disconnects a user. if the user is a guest user, the user is removed from the system. 
  //if the user is a member user, the users session is invalidated.
  public disconnectUser(userId: string): void {
    this.isConnectionValid(userId);
    this.controllers.Auth.disconnect(userId);
  }

  
}
