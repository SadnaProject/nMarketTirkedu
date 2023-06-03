import { beforeEach, describe, expect, it } from "vitest";
import { type Notification, NotificationsRepo } from "./NotificationsRepo";
import { channel } from "diagnostics_channel";

let notificationsRepo: NotificationsRepo;

beforeEach(() => {
  notificationsRepo = new NotificationsRepo();
});

describe("Add Notification", () => {
  it("should add notification", () => {
    const userId = "userId";
    const tempEvent = {
      channel: "storePurchase_123",
      type: "storePurchase",
      storeId: "123",
    };
    const notification = {
      ...tempEvent,
      isRead: false,
      id: "123",
    } as Notification;
    notificationsRepo.addNotification(userId, notification);
    const notifications = notificationsRepo.getUnreadNotifications(userId);
    expect(notifications.length).toBe(1);
  });
});

describe("Get Unread Notifications", () => {
  it("should get unread notifications", () => {
    const userId = "userId";
    const tempEvent = {
      channel: "storePurchase_123",
      type: "storePurchase",
      storeId: "123",
    };
    const notification1 = {
      ...tempEvent,
      isRead: false,
      id: "1",
    } as Notification;
    const notification2 = {
      ...tempEvent,
      isRead: false,
      id: "2",
    } as Notification;
    notificationsRepo.addNotification(userId, notification1);
    notificationsRepo.addNotification(userId, notification2);
    const notifications = notificationsRepo.getUnreadNotifications(userId);
    expect(notifications.length).toBe(2);
    notificationsRepo.markAsRead(userId, "1");
    const notifications2 = notificationsRepo.getUnreadNotifications(userId);
    expect(notifications2.length).toBe(1);
  });
});
