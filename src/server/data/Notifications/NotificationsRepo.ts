import { Event } from "server/domain/helpers/_Events";
import { Testable, testable } from "server/helpers/_Testable";

@testable
export class NotificationsRepo extends Testable {
  private userToNotifications: Map<string, Notification[]>;

  constructor() {
    super();
    this.userToNotifications = new Map<string, Notification[]>();
  }

  public addNotification(userId: string, notification: Notification): void {
    this.userToNotifications.set(userId, [
      ...(this.userToNotifications.get(userId) || []),
      notification,
    ]);
  }

  public getUnreadNotifications(userId: string): Notification[] {
    return (
      this.userToNotifications
        .get(userId)
        ?.filter((notification) => !notification.isRead) || []
    );
  }

  public markAsRead(userId: string, notificationId: string): void {
    const notifications = this.userToNotifications.get(userId);
    if (!notifications) {
      return;
    }
    const notification = notifications.find(
      (notification) => notification.id === notificationId
    );
    if (!notification) {
      return;
    }
    notification.isRead = true;
  }
}

export type Notification = Event & { isRead: boolean; id: string };
