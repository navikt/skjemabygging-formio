import { NextFunction, Request, Response } from "express";
import { HttpError as OldHttpError } from "../../../fetchUtils";
import { logger } from "../../../logging/logger";
import { ApiError, HttpError } from "./errors";

const apiErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    logger.error(`HttpError: ${error.message} (${error.status})`);
    res.sendStatus(error.status);
  } else if (error instanceof OldHttpError && error.response.status === 401) {
    logger.warn("Unauthorized", error.message);
    res.status(401).send("Unauthorized");
  } else if (error instanceof ApiError) {
    logger.error(error);
    res.contentType("application/json");
    res.status(500).send({ message: error.message, functional: error.functional });
  } else {
    logger.error("Internal server error:", error);
    res.status(500).send(`Noe galt skjedde: ${error.message}`);
  }
};

export default apiErrorHandler;
