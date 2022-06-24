import { NextFunction, Request, Response } from "express";
import { getFormioToken } from "../../../util/requestTool";
import { UnauthorizedError } from "./errors";

const authorizedPublisher = (req: Request, res: Response, next: NextFunction) => {
  if (!getFormioToken(req)) {
    next(new UnauthorizedError("Missing formio token"));
  }
  next();
};

export default authorizedPublisher;
