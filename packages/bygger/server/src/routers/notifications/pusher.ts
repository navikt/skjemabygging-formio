import { NextFunction, Request, Response } from "express";
import { logger } from "../../logging/logger";
import { pusherService } from "../../services";
import { PusherEvent } from "../../services/PusherService";
import { ApiError } from "../api/helpers/errors";

const pusher = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    const pusherEvent: PusherEvent = req.body;
    try {
      logger.info("Trigger pusher event", { pusherEvent });
      await pusherService.trigger(pusherEvent);
    } catch (error) {
      logger.warn("Failed to trigger pusher event", { pusherEvent, error });
      return next(new ApiError("Failed to trigger pusher event", true, error as Error));
    }
    return res.sendStatus(200);
  },
};

export default pusher;
