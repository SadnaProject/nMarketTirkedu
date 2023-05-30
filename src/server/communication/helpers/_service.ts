import { Service } from "server/service/Service";

const globalForService = global as unknown as {
  service: Service;
};

export const service = globalForService.service ?? new Service();
globalForService.service = service;
