import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from "jose";
import { GetKeyFunction } from "jose/dist/types/types";
import jwt from "jsonwebtoken";
import config from "../config";
import { AzureAdTokenPayload, User } from "../types/custom";
import { getDevUser } from "../util/devUser";
import { adGroups } from "./azureAd";

function toExpiredDateString(exp?: number) {
  if (exp) {
    const expDate = new Date(0);
    expDate.setUTCSeconds(exp);
    return expDate.toLocaleString();
  }
  return undefined;
}

const getAzureRemoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> = createRemoteJWKSet(
  new URL(config.azure.openidConfigJwksUri)
);

const verifyToken = async (token: string): Promise<AzureAdTokenPayload> => {
  const verified = await jwtVerify(token, getAzureRemoteJWKSet, {
    algorithms: ["RS256"],
    issuer: config.azure.openidConfigIssuer,
    audience: config.azure.clientId,
  });
  return verified.payload as AzureAdTokenPayload;
};

const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  if (config.isDevelopment) {
    const user: User = await getDevUser(req);
    req.getUser = () => user;
  } else {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.error("Missing jwt token");
      return res.sendStatus(401);
    }

    console.log("Verifying jwt token signature...");
    let tokenPayload: AzureAdTokenPayload;
    try {
      tokenPayload = await verifyToken(token);
    } catch (err) {
      console.error("Failed to verify jwt token signature", err);
      return res.sendStatus(401);
    }
    if (!tokenPayload) {
      console.error("Error decoding jwt token");
      return res.sendStatus(401);
    }
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenPayload.exp! - 10 < currentTime;
    if (expired) {
      console.log(`JWT token expired (exp=${tokenPayload.exp})`);
      return res.sendStatus(401);
    }

    console.log(`Validation of jwt token succeeded (expires ${toExpiredDateString(tokenPayload.exp)})`);
    req.getUser = () => ({
      name: tokenPayload.name,
      preferredUsername: tokenPayload.preferred_username,
      NAVident: tokenPayload.NAVident,
      isAdmin: tokenPayload.groups?.includes(adGroups.ADMINISTRATOR) || false,
    });
  }
  next();
};

export const createFormioJwt = (user: User) => {
  const { formio } = config;
  const tokenPayload = {
    external: true,
    form: {
      _id: formio.formIds.userResource,
    },
    project: {
      _id: formio.projectId,
    },
    user: {
      _id: user.NAVident,
      data: {
        name: user.name,
      },
      roles: [formio.roleIds.authenticated],
    },
  };
  return jwt.sign(tokenPayload, formio.jwtSecret, { expiresIn: "9h" });
};

export default authHandler;
