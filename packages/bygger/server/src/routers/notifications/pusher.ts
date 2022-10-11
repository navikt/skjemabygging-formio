import { NextFunction, Request, Response } from "express";
import { logger } from "../../logging/logger";
import { pusherService } from "../../services";
import { PusherEvent } from "../../services/PusherService";
import { toMeta } from "../../util/logUtils";
import { ApiError } from "../api/helpers/errors";

const pusher = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    const pusherEvent: PusherEvent = req.body;
    const logMeta = toMeta("pusherEvent", pusherEvent);
    try {
      logger.info("Trigger pusher event", logMeta);
      await pusherService.trigger(pusherEvent);
    } catch (error) {
      logger.warn("Failed to trigger pusher event", { ...logMeta, error });
      return next(new ApiError("Failed to trigger pusher event", true, error as Error));
    }
    return res.sendStatus(200);
  },
};

export default pusher;
