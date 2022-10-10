import { createHash } from "crypto";
import { NextFunction, Request, Response } from "express";
import config from "../config";
import { UnauthorizedError } from "../routers/api/helpers/errors";

const hash = (password: string) => createHash("sha256").update(password).digest("hex");

const authorizedPusher = async (req: Request, res: Response, next: NextFunction) => {
  const pusherSecretHash = req.get("Bygger-Pusher-Secret-Hash");
  if (!pusherSecretHash) {
    next(new UnauthorizedError("Missing pusher secret hash"));
    return;
  }
  if (pusherSecretHash !== hash(config.pusher.secret)) {
    next(new UnauthorizedError("Invalid pusher secret"));
    return;
  }
  next();
};

export default authorizedPusher;
