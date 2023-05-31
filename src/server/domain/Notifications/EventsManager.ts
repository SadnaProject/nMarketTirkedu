import EventEmitter from "events";
import { type Channel, type Event } from "../helpers/_Events";
import {
  NotificationsRepo,
  type Notification,
} from "server/data/Notifications/NotificationsRepo";
import { randomUUID } from "crypto";

export class EventManager {
  private eventEmitter: EventEmitter;
  private onlineUsers: Map<string, (msg: Event) => void>;
  private channelToUsers: Map<string, string[]>;
  private notificationsRepo: NotificationsRepo;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.onlineUsers = new Map<string, (msg: Event) => void>();
    this.channelToUsers = new Map<string, string[]>();
    this.notificationsRepo = new NotificationsRepo();
  }

  public subscribeChannel(channel: Channel, userId: string) {
    const callback = this.onlineUsers.get(userId);
    if (!callback) {
      return;
    }
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

  public emitEvent(event: Event) {
    this.eventEmitter.emit(event.channel, event);
    for (const userId of this.channelToUsers.get(event.channel) || []) {
      // check if the user is online
      this.notificationsRepo.addNotification(userId, {
        ...event,
        isRead: this.onlineUsers.has(userId),
        id: randomUUID(),
      });
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

  public getUnreadNotifications(userId: string): Notification[] {
    return this.notificationsRepo.getUnreadNotifications(userId);
  }
}
