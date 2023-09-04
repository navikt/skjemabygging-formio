import { RequestHandler } from "express";
import { UnauthorizedError } from "../routers/api/helpers/errors";

const adGroups = {
  USER: "1d12af59-d953-4f85-9f65-d8cbf6672deb",
  ADMINISTRATOR: "0c0e4023-5fd3-4cfe-8b40-3b98645bb08f",
};

const adHandlers: RequestHandlers = {
  isAdmin: (req, res, next) => {
    if (req.getUser().isAdmin) {
      next();
    } else {
      next(new UnauthorizedError("User is not administrator"));
    }
  },
};

type RequestHandlers = {
  [key: string]: RequestHandler;
};

export { adGroups, adHandlers };
