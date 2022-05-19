import { NextFunction, Response } from "express";
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, JWTPayload, jwtVerify } from "jose";
import { GetKeyFunction } from "jose/dist/types/types";
import jwt from "jsonwebtoken";
import config from "../config";
import { ByggerRequest, User } from "../types";

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

const verifyToken = async (token: string) => {
  const verified = await jwtVerify(token, getAzureRemoteJWKSet, {
    algorithms: ["RS256"],
    issuer: config.azure.openidConfigIssuer,
    audience: config.azure.clientId,
  });
  return verified.payload;
};

const authHandler = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  if (!config.isDevelopment) {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("Missing jwt token");
      return res.sendStatus(401);
    }

    console.log("Verifying jwt token signature...", token);
    let tokenPayload: JWTPayload;
    try {
      tokenPayload = await verifyToken(token);
    } catch (err) {
      console.log("Failed to verify jwt token signature", err);
      return res.sendStatus(401);
    }
    if (!tokenPayload) {
      console.log("Error decoding jwt token");
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
      name: tokenPayload.name as string,
      preferredUsername: tokenPayload.preferred_username as string,
      NAVident: tokenPayload.NAVident as string,
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
      roles: [formio.roleIds.administrator],
    },
  };
  return jwt.sign(tokenPayload, formio.jwtSecret, { expiresIn: "8h" });
};

export default authHandler;
