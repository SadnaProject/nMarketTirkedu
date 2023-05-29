import EventEmitter from "events";

export class EventManager {
  private eventEmitter: EventEmitter;
  private onlineUsers: Map<string, (msg: Event) => void>;
  private channelToUsers: Map<string, string[]>;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.onlineUsers = new Map<string, (msg: Event) => void>();
    this.channelToUsers = new Map<string, string[]>();
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
  }

  public subscribeUser(userId: string, callback: (msg: Event) => void) {
    this.onlineUsers.set(userId, callback);
  }

  public unsubscribeUser(userId: string) {
    const observer = this.onlineUsers.get(userId);
    if (!observer) {
      return;
    }
    this.onlineUsers.delete(userId);
    // remove the user from all events
    this.channelToUsers.forEach((users, channel) => {
      if (users.includes(userId)) {
        this.eventEmitter.off(channel, observer);
        this.channelToUsers.set(
          channel,
          users.filter((u) => u !== userId)
        );
      }
    });
  }

  public getStorePurchaseEventString(storeId: string): string {
    return `storePurchase_${storeId}`;
  }
  public getStoreChangedEventString(storeId: string): string {
    return `storeChanged_${storeId}`;
  }
}

export type Event =
  | {
      channel: `storePurchase_${string}`;
      type: "storePurchase";
      storeId: string;
      // more data
    }
  | {
      channel: `storeChanged_${string}`;
      type: "storeChanged";
      storeId: string;
      // more data
    };

type Channel = Event["channel"];
