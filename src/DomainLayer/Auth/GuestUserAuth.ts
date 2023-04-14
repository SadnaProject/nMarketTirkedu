import { Session } from "./Session";
import { UserAuth} from "./UserAuth";
import type {UserAuthDTO } from "./UserAuth";
import { z } from "zod";



export type GuestUserAuthDTO = UserAuthDTO
export class GuestUserAuth extends UserAuth {
  

  constructor() {
    super("GUEST");

  }
  static create(): GuestUserAuth {
    const guestUserAuth = new GuestUserAuth();
    guestUserAuth.addSession(new Session(guestUserAuth.UserId));
    return guestUserAuth;
  }
  static createFromDTO(dto: GuestUserAuthDTO): GuestUserAuth {
    const guestUserAuth = new GuestUserAuth();
    guestUserAuth.userId = dto.userId;
    guestUserAuth.type = dto.type;
    guestUserAuth.sessions = dto.sessions;
    return guestUserAuth;
  }
  public get DTO(): GuestUserAuthDTO {
    return {
      userId: this.userId,
      type: this.type,
      sessions: this.sessions,
    };
  }


  //Logged in= has a valid session as a member
  //Connected= has a valid session as a guest or a member
  public isUserLoggedInAsMember(): boolean {
    return false;
  }
  public isUserLoggedInAsGuest(): boolean {
    return this.isConnectionValid();
  }
}

