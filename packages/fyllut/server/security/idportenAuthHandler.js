import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { logger } from "../logger.js";

const idportenAuthHandler = (req, res, next) => {
  const innsendingHeader = req.header("Fyllut-Submission-Method");
  if (innsendingHeader === "digital" && process.env.NODE_ENV !== "development") {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.debug("Missing jwt token");
      return res.sendStatus(401);
    }

    logger.debug("Validating jwt token...");
    const tokenContent = jwt.decode(token, {});
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenContent.exp - 10 < currentTime;
    const idportenClientIdMismatch = tokenContent.client_id !== config.idportenClientId;
    const wrongSecurityLevel = tokenContent.acr !== "Level4";
    if (expired || idportenClientIdMismatch || wrongSecurityLevel) {
      logger.debug("Validation of jwt token failed", {
        jwtToken: {
          expired,
          idportenClientIdMismatch,
          wrongSecurityLevel,
        },
      });
      return res.sendStatus(401);
    }

    logger.debug("Validation of jwt token succeeded");
    // TODO set res.locals.user?
  }
  next();
};

export default idportenAuthHandler;
