import { randomUUID } from "crypto";
import { db } from "server/db";

export class Notification {
  private id: string;
  private type: string;
  private message: string;
  private isRead: boolean;

  constructor(type: string, message: string) {
    this.id = randomUUID();
    this.type = type;
    this.message = message;
    this.isRead = false;
  }

  public get Id(): string {
    return this.id;
  }

  public get Message(): string {
    return this.message;
  }

  public get IsRead(): boolean {
    return this.isRead;
  }
  public set IsRead(isRead: boolean) {
    this.isRead = isRead;
  }

  public async read() {
    this.isRead = true;
    await db.notification.update({
      where: { id: this.id },
      data: { isRead: true },
    });
  }
  public get Type(): string {
    return this.type;
  }
  public toString(): string {
    return `Notification id: ${this.id} Type: ${this.type} Message: ${this.message}. \n`;
  }
  static createFromDTO(dto: {
    id: string;
    userId: string;
    type: string;
    message: string;
    isRead: boolean;
  }): Notification {
    const i = new Notification(dto.type, dto.message);
    i.isRead = dto.isRead;
    i.id = dto.id;
    return i;
  }
}
