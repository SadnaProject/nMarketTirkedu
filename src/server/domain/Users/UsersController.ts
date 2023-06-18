import { TRPCError } from "@trpc/server";
import { Mixin } from "ts-mixer";
import { type ExtendedCartDTO, type CartDTO } from "./Cart";
import { Notification } from "./Notification";
import { HasRepos, createRepos } from "./helpers/_HasRepos";
import { type PaymentDetails } from "../PurchasesHistory/PaymentAdaptor";
import { Bid, type BidArgs, type BidDTO } from "./Bid";
import * as R from "ramda";
import { Testable, testable } from "server/helpers/_Testable";
import { HasControllers } from "../helpers/_HasController";
import { censored } from "../helpers/_Loggable";
import { getDB } from "server/helpers/_Transactional";
import { eventEmitter } from "../helpers/_EventEmitter";
import { fa } from "@faker-js/faker";

export interface IUsersController {
  /**
   * This fuction checks if a user exists.
   * @param userId The id of the user that is currently logged in.
   * @returns True if the user exists, false otherwise.
   */
  isUserExist(userId: string): Promise<boolean>;
  /**
   * This function gets the notifications of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The notifications of the user.
   */
  getNotifications(userId: string): Promise<Notification[]>;
  /**
   * This function adds a product to a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being added to the cart.
   * @param quantity The quantity of the product that is being added to the cart.
   */
  addProductToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void>;
  /**
   * This function removes a product from a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being removed from the cart.
   * @throws Error if the product is not in the cart.
   */
  removeProductFromCart(userId: string, productId: string): Promise<void>;
  /**
   * This function edits the quantity of a product in a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being edited in the cart.
   * @param quantity The new quantity of the product.
   * @throws Error if the product is not in the cart.
   * @throws Error if the quantity is invalid.
   */
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void>;
  /**
   * This function gets the cart of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The cart of the user.
   */
  getCart(userId: string): Promise<CartDTO>;
  /**
   * This function gets the cart of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The cart of the user.
   */
  getCartUI(userId: string): Promise<ExtendedCartDTO>;
  /**
   * This function purchases the cart of a user.
   * @param userId The id of the user that is currently logged in.
   */
  purchaseCart(
    userId: string,
    creditCard: PaymentDetails,
    delivery: {
      address: string;
      city: string;
      country: string;
      name: string;
      zip: string;
    }
  ): Promise<{ paymentTransactionId: number; deliveryTransactionId: number }>;
  /**
   * This function adds a user to the system.
   * @param user The user that is being added to the system.
   */
  addUser(userId: string, userName: string): Promise<void>;
  /**
   * This function removes a user from the system.
   * @param userId The id of the user that is being removed from the system.
   */
  removeUser(userId: string): Promise<void>;
  /**
   * This function will mark notifications as read.
   * @param userId The id of the user that is currently logged in.
   * @param notificationId The id of the notification that is being marked as read.
   * @throws Error if the notification is not in the user's notifications.
   */
  readNotification(userId: string, notificationId: string): Promise<void>;
  /**
   * This function will return the user's unread notifications.
   * @param userId The id of the user that is currently logged in.
   * @returns The user's unread notifications.
   * @throws Error if the user is not in the system.
   */
  getUnreadNotifications(userId: string): Promise<string[]>;
  /**
   * This function will add notifications to the user's notifications.
   * @param userId The id of the user that is currently logged in.
   * @param notificationType The type of the notification that is being added.
   * @param notificationMsg The message of the notification that is being added.
   * @returns The id of the notification that was added.
   */
  addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string,
    isOnline: boolean
  ): Promise<string>;
  /**
   * This function will return the user's notifications.
   * @param userId The id of the user that is currently logged in.
   * @returns The user's notifications.
   */
  getAllMessages(userId: string): Promise<string[]>;
  register(email: string, password: string): Promise<string>;
  /**
   * This function will start new session for user.
   */
  startSession(): Promise<string>;
  /**
   * This function will end the current session for user.
   * @param userId The id of the user that is currently logged in.
   */
  disconnect(userId: string): Promise<void>;
  /**
   * This function will logs in the member to the system.
   * @param guestId The id of the guest that is currently logged in.
   * @param email The email of the user that want to login.
   * @param password The password of the user that want to login.
   */
  login(guestId: string, email: string, password: string): Promise<string>;
  /**
   * This function will logs out the member from the system.
   * @param userId The id of the user that is currently logged in.
   */
  logout(userId: string): Promise<string>;
  /**
   * @param userIdOfActor The user id of the user that asks to remove the member.
   * @param memberIdToRemove The user id of the member to remove.
   * @throws Error if the asking user doesnt have the permission to remove the member(i.e the asking user is not the system admin).
   * @throws Error if the member to remove is not a member.
   * @throws Error if the member has any position(he cant be removed if he has any position).
   */
  removeMember(userIdOfActor: string, memberIdToRemove: string): Promise<void>;
  addBid(BidArgs: BidArgs): Promise<string>;
  getAllBidsSendFromUser(userId: string): Promise<BidDTO[]>;
  getAllBidsSendToUser(userId: string): Promise<BidDTO[]>;
  counterBid(userId: string, bidId: string, price: number): Promise<void>;
  approveBid(userId: string, bidId: string): Promise<string>;
  rejectBid(userId: string, bidId: string): Promise<void>;
  removeOwnerFromHisBids(userId: string, storeId: string): Promise<void>;
}

@testable
export class UsersController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IUsersController
{
  constructor() {
    super();
    this.initRepos(createRepos());
  }
  async getNotifications(userId: string): Promise<Notification[]> {
    return (await this.Repos.Users.getUser(userId)).Notifications;
  }
  async getAllMessages(userId: string): Promise<string[]> {
    const notifications = (await this.Repos.Users.getUser(userId))
      .Notifications;
    return notifications.map((notification) => notification.getMesssage());
  }

  async addProductToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const user = await this.Repos.Users.getUser(userId); // notice that we get the user from the repo and not from the system
    const storeId = await this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    const isInStock = await this.Controllers.Stores.isProductQuantityInStock(
      userId,
      productId,
      quantity
    );
    if (!isInStock) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "store doesn't have such amount of product",
      });
    }
    await user.addProductToCart(productId, quantity, storeId);
  }
  async removeProductFromCart(
    userId: string,
    productId: string
  ): Promise<void> {
    const user = await this.Repos.Users.getUser(userId);
    const storeId = await this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    await user.removeProductFromCart(productId, storeId);
  }
  async editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const user = await this.Repos.Users.getUser(userId);
    if (
      !(await this.Controllers.Stores.isProductQuantityInStock(
        userId,
        productId,
        quantity
      ))
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "store doesn't have such amount of product",
      });
    }
    const storeId = await this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    await user.editProductQuantityInCart(productId, storeId, quantity);
  }
  async getCart(userId: string): Promise<CartDTO> {
    return (await this.Repos.Users.getUser(userId)).Cart;
  }

  async getCartUI(userId: string): Promise<ExtendedCartDTO> {
    const cart = await (await this.Repos.Users.getUser(userId)).getCartUI();
    for (const b of cart.storeIdToBasket) {
      const bas = b[1];
      for (const p of bas.storeProducts) {
        p.price = await this.Controllers.Stores.getProductPrice(userId, p.id);
      }
    }
    return cart;
  }

  async purchaseCart(
    userId: string,
    @censored creditCard: PaymentDetails,
    @censored
    delivery: {
      address: string;
      city: string;
      country: string;
      name: string;
      zip: string;
    }
  ): Promise<{ paymentTransactionId: number; deliveryTransactionId: number }> {
    const user = await this.Repos.Users.getUser(userId);
    const cart = user.Cart;
    const price = await this.Controllers.Stores.getCartPrice(userId);
    const rid = await this.Controllers.PurchasesHistory.purchaseCart(
      userId,
      cart,
      price,
      creditCard,
      {
        address: delivery.address,
        city: delivery.city,
        country: delivery.country,
        name: delivery.name,
        zip: delivery.zip,
      }
    );
    const notificationMsg = `The cart has been purchased for ${price}$`;
    const notification = new Notification("purchase", notificationMsg);
    await user.addNotification(notification, true);
    await user.clearCart(); /// notice we clear the cart in the end of the purchase.
    return rid;
  }
  async addUser(userId: string): Promise<void> {
    await this.Repos.Users.addUser(userId);
  }
  async removeUser(userId: string): Promise<void> {
    await this.Repos.Users.removeUser(userId);
  }
  async readNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    const user = await this.Repos.Users.getUser(userId);
    await user.readNotification(notificationId);
  }
  async getUnreadNotifications(userId: string): Promise<string[]> {
    const user = await this.Repos.Users.getUser(userId);
    const notifications = user.Notifications.filter(
      (notification) => !notification.IsRead
    );
    return notifications.map((notification) => notification.getMesssage());
  }
  async addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string,
    isRead: boolean
  ): Promise<string> {
    const user = await this.Repos.Users.getUser(userId);
    const notification = new Notification(notificationType, notificationMsg);
    await user.addNotification(notification, isRead);
    return notification.Id;
  }
  async startSession(): Promise<string> {
    const guestId = this.Controllers.Auth.startSession();
    await this.addUser(guestId);
    return guestId;
  }
  subscribeForUserEvents(userId: string) {
    eventEmitter.subscribeChannel(`bidAdded_${userId}`, userId);
  }
  async register(email: string, @censored password: string): Promise<string> {
    const MemberId = await this.Controllers.Auth.register(email, password);
    await this.Repos.Users.addUser(MemberId);
    this.subscribeForUserEvents(MemberId);
    return MemberId;
  }
  async login(
    guestId: string,
    email: string,
    @censored password: string
  ): Promise<string> {
    await this.Repos.Users.getUser(guestId);
    const MemberId = await this.Controllers.Auth.login(
      guestId,
      email,
      password
    );
    //TODO delete guestId from users(only in this component, Auth component will handle his part)
    await this.Repos.Users.removeUser(guestId);
    await this.Repos.Users.getUser(MemberId);
    return MemberId;
  }
  async logout(userId: string): Promise<string> {
    const guestId = await this.Controllers.Auth.logout(userId);
    await this.Repos.Users.addUser(guestId);
    return guestId;
  }
  async disconnect(userId: string): Promise<void> {
    if (this.Controllers.Auth.isGuest(userId)) {
      await this.Repos.Users.removeUser(userId);
    }
    await this.Controllers.Auth.disconnect(userId);
  }
  async isUserExist(userId: string): Promise<boolean> {
    return this.Repos.Users.isUserExist(userId);
  }
  async removeMember(userIdOfActor: string, memberIdToRemove: string) {
    if (!(await this.isUserExist(memberIdToRemove))) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Given user id doesn't belong to a member",
      });
    }
    if (await this.Controllers.Jobs.isMemberInAnyPosition(memberIdToRemove)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Member is in a position, please remove him from the position first",
      });
    }
    if (!(await this.Controllers.Jobs.canRemoveMember(userIdOfActor))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User doesn't have permission to remove member",
      });
    }
    await this.Controllers.Auth.removeMember(userIdOfActor, memberIdToRemove);
    await this.removeUser(memberIdToRemove);
  }
  async addBid(bidArgs: BidArgs): Promise<string> {
    const bid = new Bid(bidArgs);
    if (bidArgs.type === "Store") {
      const storeId = await this.Controllers.Stores.getStoreIdByProductId(
        bid.UserId,
        bid.ProductId
      );
      const oids = await this.Controllers.Jobs.getIdsThatNeedToApprove(storeId);
      bid.setOwners(R.clone(oids));
      await this.Repos.Bids.addBid(bid);
      for (const oid of oids) {
        (await this.Repos.Users.getUser(oid)).addBidToMe(bid.Id);
      }
      eventEmitter.initControllers(this.Controllers);
      await eventEmitter.emitEvent({
        bidId: bid.Id,
        channel: `bidAdded_${storeId}`,
        type: "bidAdded",
        message: `You have a new bid!`,
      });
      (await this.Repos.Users.getUser(bid.UserId)).addBidFromMe(bid.Id);
      eventEmitter.subscribeChannel(`bidApproved_${bid.Id}`, bid.UserId);
      eventEmitter.subscribeChannel(`bidRejected_${bid.Id}`, bid.UserId);
    } else {
      (await this.Repos.Users.getUser(bid.UserId)).addBidFromMe(bid.Id);
      eventEmitter.subscribeChannel(`bidApproved_${bid.Id}`, bid.UserId);
      eventEmitter.subscribeChannel(`bidRejected_${bid.Id}`, bid.UserId);
      const targetUser = await this.Repos.Users.getUser(
        (
          await this.Repos.Bids.getBid(bidArgs.previousBidId)
        ).UserId
      );
      bid.setOwners([targetUser.Id]);
      await this.Repos.Bids.addBid(bid);
      targetUser.addBidToMe(bid.Id);
      eventEmitter.initControllers(this.Controllers);
      await eventEmitter.emitEvent({
        bidId: bid.Id,
        channel: `bidAdded_${targetUser.Id}`,
        type: "bidAdded",
        message: `You have a new bid!`,
      });
    }
    return bid.Id;
  }
  async approveBid(userId: string, bidId: string) {
    const bid = await this.Repos.Bids.getBid(bidId);
    if (bid.State !== "WAITING") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid is not waiting for approval",
      });
    }
    if (
      (bid.Type == "Store" &&
        !(
          await this.Controllers.Jobs.getIdsThatNeedToApprove(
            await this.Controllers.Stores.getStoreIdByProductId(
              bid.UserId,
              bid.ProductId
            )
          )
        ).includes(userId)) ||
      (bid.Type === "Counter" && !bid.Owners.includes(userId))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User doesn't have permission to approve bid",
      });
    }
    if (!(await this.Repos.Users.getUser(userId)).isBidExistToMe(bidId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User doesn't have this bid",
      });
    }
    await this.Repos.Bids.approveBid(bidId, userId);
    // await this.Repos.Bids.updateBid(bid); //TODO:  needed!!!!
    const state = await this.Repos.Bids.bidState(bidId);

    if (state === "APPROVED") {
      eventEmitter.initControllers(this.Controllers);
      await eventEmitter.emitEvent({
        bidId: bid.Id,
        channel: `bidApproved_${bid.Id}`,
        type: "bidApproved",
        message: `Your bid has been approved!`,
      });
      switch (bid.Type) {
        case "Store":
          await this.Controllers.Stores.addSpecialPriceToProduct(bid);

          break;
        case "Counter":
          return await this.addBid({
            userId: userId,
            type: "Store",
            price: bid.Price,
            productId: bid.ProductId,
          });
      }
    }
    return bidId;
  }
  async rejectBid(userId: string, bidId: string): Promise<void> {
    const bid = await this.Repos.Bids.getBid(bidId);
    if (!bid.Owners.includes(userId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User doesn't have permission to reject bid",
      });
    }
    await this.Repos.Bids.rejectBid(bidId, userId);
    eventEmitter.initControllers(this.Controllers);
    await eventEmitter.emitEvent({
      bidId: bid.Id,
      channel: `bidRejected_${bid.Id}`,
      type: "bidRejected",
      message: `Your bid has been rejected!`,
    });
  }
  async counterBid(
    userId: string,
    bidId: string,
    price: number
  ): Promise<void> {
    const bid = await this.Repos.Bids.getBid(bidId);
    if (bid.State !== "WAITING") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid is not waiting for approval",
      });
    }
    if (
      !(
        await this.Controllers.Jobs.getIdsThatNeedToApprove(
          await this.Controllers.Stores.getStoreIdByProductId(
            bid.UserId,
            bid.ProductId
          )
        )
      ).includes(userId)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User doesn't have permission to counter bid",
      });
    }
    await this.Repos.Bids.rejectBid(bidId, userId);
    eventEmitter.initControllers(this.Controllers);
    await eventEmitter.emitEvent({
      bidId: bid.Id,
      channel: `bidRejected_${bid.Id}`,
      type: "bidRejected",
      message: `Your bid has been rejected!`,
    });

    await this.addBid({
      previousBidId: bidId,
      price: price,
      productId: bid.ProductId,
      userId: userId,
      type: "Counter",
    });
  }

  async getAllBidsSendToUser(userId: string): Promise<BidDTO[]> {
    const bids: BidDTO[] = [];
    const allBids = await this.Repos.Bids.getAllBids();
    for (const bid of allBids) {
      if (bid.Owners.includes(userId)) {
        const bidDTO = bid.DTO;
        bidDTO.productName = (
          await this.Controllers.Stores.getProductById(userId, bid.ProductId)
        ).name;
        bids.push(bidDTO);
      }
    }
    return bids;
  }
  async getAllBidsSendFromUser(userId: string): Promise<BidDTO[]> {
    const bids: BidDTO[] = [];
    const allBids = await this.Repos.Bids.getAllBidsSentByUser(userId);
    for (const bid of allBids) {
      const bidDTO = bid.DTO;
      bidDTO.productName = (
        await this.Controllers.Stores.getProductById(userId, bid.ProductId)
      ).name;
      bids.push(bidDTO);
    }
    return bids;
  }
  async removeOwnerFromHisBids(userId: string, storeId: string): Promise<void> {
    const bids = await this.Repos.Bids.getAllBids();
    for (const bid of bids) {
      if (
        bid.Owners.includes(userId) &&
        bid.State === "WAITING" &&
        bid.Type === "Store" &&
        (await this.Controllers.Stores.getStoreIdByProductId(
          bid.UserId,
          bid.ProductId
        )) === storeId
      ) {
        await this.Repos.Bids.removeOwnerFromBid(bid.Id, userId);
        await this.updateBid(bid.Id);
      }
    }
  }
  async updateBid(bidId: string): Promise<void> {
    const bid = await this.Repos.Bids.getBid(bidId);
    if (bid.State === "WAITING") {
      if (bid.Owners === bid.ApprovedBy) {
        await this.Repos.Bids.forceApprove(bidId);
        eventEmitter.initControllers(this.Controllers);
        await eventEmitter.emitEvent({
          bidId: bid.Id,
          channel: `bidApproved_${bid.Id}`,
          type: "bidApproved",
          message: `Your bid has been approved!`,
        });
      }
    }
  }
}
