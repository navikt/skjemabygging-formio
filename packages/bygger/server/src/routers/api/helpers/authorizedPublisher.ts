import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "./errors";

const authorizedPublisher = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.token) {
    next(new UnauthorizedError("Missing formio token"));
  }
  next();
};

export default authorizedPublisher;
