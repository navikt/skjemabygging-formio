import { Request } from "express";

export type ByggerRequest = Request & {
  getUser?: Function;
};
