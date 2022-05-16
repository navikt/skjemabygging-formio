import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { ByggerRequest, User } from "../types";

const authHandler = (req: ByggerRequest, res: Response, next: NextFunction) => {
  if (!config.isDevelopment) {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("Missing jwt token");
      return res.sendStatus(401);
    }

    console.log("Validating jwt token...", token);
    const tokenContent = jwt.decode(token, {}) as JwtPayload;
    if (!tokenContent) {
      console.log("Error decoding jwt token");
      return res.sendStatus(401);
    }
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenContent.exp! - 10 < currentTime;
    const azureClientIdMismatch = tokenContent.aud !== config.azure.clientId;
    if (expired || azureClientIdMismatch) {
      console.log(`Validation of jwt token failed (expired=${expired}, cliendIdMismatch=${azureClientIdMismatch})`);
      return res.sendStatus(401);
    }

    console.log("Validation of jwt token succeeded");
    req.getUser = () => ({
      name: tokenContent.name,
      preferredUsername: tokenContent.preferred_username,
      NAVident: tokenContent.NAVident,
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
