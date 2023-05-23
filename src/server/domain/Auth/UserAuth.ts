import { randomUUID } from "crypto";
import { type Session } from "./Session";
import { z } from "zod";
import { db } from "server/db";

export type UserType = "GUEST" | "MEMBER";

export type UserAuthDTO = {
  id: string;
  // email: string;
  // password: string;
  type?: UserType;
  sessions?: Session[];
};
export abstract class UserAuth {
  protected userId: string;
  // private email: string;
  // private password: string;
  protected type: UserType;
  protected sessions: Session[];
  protected isLoggedIn: boolean;

  protected constructor(type: UserType) {
    this.userId = randomUUID();
    this.type = type;
    this.sessions = [];
    this.isLoggedIn = false;
  }

  public get UserId(): string {
    return this.userId;
  }

  public get DTO(): UserAuthDTO {
    return {
      id: this.userId,
      // email: this.email,
      // password: this.password,
      type: this.type,
      sessions: this.sessions,
    };
  }

  protected addSession(session: Session): void {
    this.sessions.push(session);
  }
  public get IsLoggedIn(): boolean {
    return this.isLoggedIn;
  }
  public async setIsLoggedIn(isLoggedIn: boolean) {
    await db.userAuth.update({
      where: { id: this.userId },
      data: { isLoggedIn: isLoggedIn },
    });
    this.isLoggedIn = isLoggedIn;
  }

  public isConnectionValid(): boolean {
    return true;
    // const latestSession = this.getLatestSession();
    // if (latestSession === undefined) {
    //   return false;
    // }
    // return latestSession.isValid();
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
