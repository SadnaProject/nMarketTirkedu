import { type Session } from "./Session";

export type UserType = "GUEST" | "MEMBER";

export class UserAuth {
  private userId: string;
  private email: string;
  private password: string;
  private type: UserType;
  private sessions: Session[];

  constructor(userId: string, type: UserType, email: string, password: string) {
    this.userId = userId;
    this.type = type;
    this.email = email;
    this.password = password;
    this.sessions = [];
  }

  public get UserId(): string {
    return this.userId;
  }

  public get Email(): string {
    return this.email;
  }
}
