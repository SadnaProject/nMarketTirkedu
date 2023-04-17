import { randomUUID } from "crypto";

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

  public read() {
    this.isRead = true;
  }
  public get Type(): string {
    return this.type;
  }
  public toString(): string {
    return `Notification id: ${this.id} Type: ${this.type} Message: ${this.message}. \n`;
  }
}
