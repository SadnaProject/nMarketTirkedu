import { z } from "zod";
const { randomUUID } = await import("crypto");

const nameSchema = z.string().nonempty();

export type StoreDTO = {
  id: string;
  name: string;
  isActive: boolean;
};

export class Store {
  private id: string;
  private name: string;
  private isActive: boolean;

  constructor(name: string) {
    nameSchema.parse(name);
    this.id = randomUUID();
    this.name = name;
    this.isActive = true;
  }

  static fromDTO(dto: StoreDTO) {
    const store = new Store(dto.name);
    store.id = dto.id;
    store.isActive = dto.isActive;
    return store;
  }

  public get Id() {
    return this.id;
  }

  public get Name() {
    return this.name;
  }

  public get IsActive() {
    return this.isActive;
  }

  public set IsActive(isActive: boolean) {
    this.isActive = isActive;
  }

  public get DTO(): StoreDTO {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
    };
  }
}
