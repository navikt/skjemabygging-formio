import { Request } from "express";

const getFormioToken = (req: Request) => {
  return req.get("formio-token") ?? req.body?.token;
};

export { getFormioToken };
