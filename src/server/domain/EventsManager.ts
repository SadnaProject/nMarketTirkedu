import { Observer } from "@trpc/server/observable";
import EventEmitter from "events";

export class EventManager {
  private eventEmitter: EventEmitter;
  private onlineUsers: Map<string, (msg: unknown) => void>; // change to online users
  // private usersToEvent : Map<string, string[]>; // swap to event to users (all registered users), then add for all in db
  private eventToUsers: Map<string, string[]>;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.onlineUsers = new Map<string, (msg: unknown) => void>();
    // this.usersToEvent = new Map<string, string[]>();
    this.eventToUsers = new Map<string, string[]>();
  }
  public subscribeToEvent(event: string, userId: string): void {
    const observer = this.onlineUsers.get(userId);
    if (!observer) {
      return;
    }
    this.eventEmitter.on(event, observer);
    // this.usersToEvent.set(userId, [...(this.usersToEvent.get(userId) || []), event]);
    this.eventToUsers.set(event, [
      ...(this.eventToUsers.get(event) || []),
      userId,
    ]);
  }
  public unsubscribeFromEvent(event: string, userId: string): void {
    const observer = this.onlineUsers.get(userId);
    if (!observer) {
      return;
    }
    this.eventEmitter.off(event, observer);
    // this.usersToEvent.set(userId, this.usersToEvent.get(userId)?.filter((e)=>e!==event) || []);
    this.eventToUsers.set(
      event,
      this.eventToUsers.get(event)?.filter((e) => e !== userId) || []
    );
  }
  public emitEvent(event: string): void {
    this.eventEmitter.emit(event);
  }
  public subscribeToEmitter(
    userId: string,
    callback: (msg: unknown) => void
  ): void {
    this.onlineUsers.set(userId, callback);
  }
  public unsubscribeFromEmitter(userId: string): void {
    const observer = this.onlineUsers.get(userId);
    if (!observer) {
      return;
    }
    // this.usersToEvent.get(userId)?.forEach((event)=>this.eventEmitter.off(event, observer));
    // remove the user from all events
    this.eventToUsers.forEach((users, event) => {
      if (users.includes(userId)) {
        this.eventEmitter.off(event, observer);
      }
    });
    this.onlineUsers.delete(userId);
    // this.usersToEvent.delete(userId);
    this.eventToUsers.forEach((users, event) => {
      this.eventToUsers.set(
        event,
        users.filter((u) => u !== userId)
      );
    });
  }

  public getStorePurchaseEventString(storeId: string): string {
    return `storePurchase_${storeId}`;
  }
}
