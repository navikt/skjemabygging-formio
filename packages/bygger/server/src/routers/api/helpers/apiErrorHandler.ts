import { NextFunction, Request, Response } from "express";
import { HttpError as OldHttpError } from "../../../fetchUtils";
import { HttpError } from "./errors";

const apiErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    console.log(`HttpError: ${error.message} (${error.status})`);
    res.sendStatus(error.status);
  } else if (error instanceof OldHttpError && error.response.status === 401) {
    console.log("Unauthorized", error.message);
    res.status(401).send("Unauthorized");
  } else {
    console.error("Internal server error", error.message);
    res.status(500).send(`Noe galt skjedde: ${error.message}`);
  }
};

export default apiErrorHandler;
