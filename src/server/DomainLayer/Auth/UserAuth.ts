import { type Session } from "./Session";

export type UserRole = "GUEST" | "MEMBER";

export class UserAuth {
  private userId: string;
  private role: UserRole;
  private sessions: Session[];

  constructor(userId: string, role: UserRole) {
    this.userId = userId;
    this.role = role;
    this.sessions = [];
  }
}
