import { NextFunction, Response } from "express";
import formio from "../../../services/formio";
import { ByggerRequest } from "../../../types";
import { UnauthorizedError } from "./errors";

const authorizedPublisher = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = req.body.token;
  if (!formioToken) {
    next(new UnauthorizedError("Missing formio token"));
    return;
  }
  try {
    await formio.getFormioUser(formioToken);
  } catch (e) {
    next(new UnauthorizedError("Invalid formio token"));
    return;
  }
  next();
};

export default authorizedPublisher;
