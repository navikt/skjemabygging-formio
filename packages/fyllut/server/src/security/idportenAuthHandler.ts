import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from "jose";
import { GetKeyFunction } from "jose/dist/types/types";
import { config } from "../config/config";
import { logger } from "../logger.js";
import { IdportenTokenPayload } from "../types/custom";

const { isDevelopment, mockIdportenJwt, mockIdportenPid } = config;

const getIdportenRemoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> = createRemoteJWKSet(
  new URL(config.idporten!.idportenJwksUri)
);

const verifyToken = async (token: string): Promise<IdportenTokenPayload> => {
  const verified = await jwtVerify(token, getIdportenRemoteJWKSet, {
    algorithms: ["RS256"],
    issuer: config.idporten!.idportenIssuer,
  });
  return verified.payload as IdportenTokenPayload;
};

const idportenAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (isDevelopment) {
    logger.debug("Mocking idporten jwt and pid");
    req.getIdportenJwt = () => mockIdportenJwt;
    req.getIdportenPid = () => mockIdportenPid!;
  } else if (authHeader) {
    const token = authHeader.split(" ")[1];

    logger.debug("Verifying jwt...");
    let tokenContent: IdportenTokenPayload;
    try {
      tokenContent = await verifyToken(token);
    } catch (err) {
      logger.warn("Failed to verify jwt signature", err);
      return res.sendStatus(401);
    }
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenContent.exp! - 10 < currentTime;
    const idportenClientIdMismatch = tokenContent.client_id !== config.idporten!.idportenClientId;
    const wrongSecurityLevel = tokenContent.acr !== "Level4";
    if (expired || idportenClientIdMismatch || wrongSecurityLevel) {
      logger.debug("Validation of jwt failed", {
        jwtErrors: {
          expired,
          idportenClientIdMismatch,
          wrongSecurityLevel,
        },
      });
      return res.sendStatus(401);
    }

    logger.debug("Validation of jwt succeeded");
    req.getIdportenJwt = () => token;
    req.getIdportenPid = () => tokenContent.pid;
  } else if (req.header("Fyllut-Submission-Method") === "digital") {
    logger.debug("Missing jwt");
    return res.sendStatus(401);
  }

  next();
};

export default idportenAuthHandler;
