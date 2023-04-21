import { randomUUID } from "crypto";
import { type Session } from "./Session";
import { z } from "zod";

export type UserType = "GUEST" | "MEMBER";

export type UserAuthDTO = {
  userId: string;
  // email: string;
  // password: string;
  type: UserType;
  sessions: Session[];
};
export abstract class UserAuth {
  protected userId: string;
  // private email: string;
  // private password: string;
  protected type: UserType;
  protected sessions: Session[];

  protected constructor(type: UserType) {
    this.userId = randomUUID();
    this.type = type;
    this.sessions = [];
  }

  public get UserId(): string {
    return this.userId;
  }

  public get DTO(): UserAuthDTO {
    return {
      userId: this.userId,
      // email: this.email,
      // password: this.password,
      type: this.type,
      sessions: this.sessions,
    };
  }

  protected addSession(session: Session): void {
    this.sessions.push(session);
  }

  public isConnectionValid(): boolean {
    const latestSession = this.getLatestSession();
    if (latestSession === undefined) {
      return false;
    }
    return latestSession.isValid();
  }
  protected getLatestSession(): Session | undefined {
    if (this.sessions.length === 0) {
      return undefined;
    }
    return this.sessions[this.sessions.length - 1];
  }
  //Logged in= has a valid session as a member
  //Connected= has a valid session as a guest or a member
  abstract isUserLoggedInAsMember(): boolean;
  abstract isUserLoggedInAsGuest(): boolean;
  public isGuest(): boolean {
    return this.type === "GUEST";
  }
  public isMember(): boolean {
    return this.type === "MEMBER";
  }
}
