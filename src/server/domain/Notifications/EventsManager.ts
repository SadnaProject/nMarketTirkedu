import EventEmitter from "events";
import { type Channel, type Event } from "../helpers/_Events";
import { randomUUID } from "crypto";
import { HasControllers } from "../helpers/_HasController";
import { is } from "ramda";

export class EventManager extends HasControllers {
  private eventEmitter: EventEmitter;
  private onlineUsers: Map<string, (msg: Event) => void>;
  private channelToUsers: Map<string, string[]>;

  constructor() {
    super();
    this.eventEmitter = new EventEmitter();
    this.onlineUsers = new Map<string, (msg: Event) => void>();
    this.channelToUsers = new Map<string, string[]>();
  }

  public subscribeChannel(channel: Channel, userId: string) {
    const callback = this.onlineUsers.get(userId);
    if (!callback) {
      return;
    }
    console.log("subscribe", channel, userId);
    this.eventEmitter.on(channel, callback);
    this.channelToUsers.set(channel, [
      ...(this.channelToUsers.get(channel) || []),
      userId,
    ]);
  }

  public unsubscribeChannel(channel: Channel, userId: string) {
    const callback = this.onlineUsers.get(userId);
    if (!callback) {
      return;
    }
    this.eventEmitter.off(channel, callback);
    this.channelToUsers.set(
      channel,
      this.channelToUsers.get(channel)?.filter((e) => e !== userId) || []
    );
  }

  public async emitEvent(event: Event) {
    console.log("emit", event);
    this.eventEmitter.emit(event.channel, event);
    const users = this.channelToUsers.get(event.channel);
    if (users) {
      for (const userId of users) {
        // check if the user is online
        console.log("emit to user", userId);
        const isOnline = this.onlineUsers.has(userId);
        await this.Controllers.Users.addNotification(
          userId,
          event.type,
          event.message,
          isOnline
        );
      }
    } else {
      console.log("users undefined", users);
    }
  }

  public subscribeUser(userId: string, callback: (msg: Event) => void) {
    this.onlineUsers.set(userId, callback);
  }

  public unsubscribeUser(userId: string) {
    const callback = this.onlineUsers.get(userId);
    if (!callback) {
      return;
    }
    this.onlineUsers.delete(userId);
    // remove the user from all events
    this.channelToUsers.forEach((users, channel) => {
      if (users.includes(userId)) {
        this.eventEmitter.off(channel, callback);
        this.channelToUsers.set(
          channel,
          users.filter((u) => u !== userId)
        );
      }
    });
  }
}
