import { Response } from "express";
import appConfig from "../../config";
import { createFormioJwt } from "../../middleware/authHandler";
import { ByggerRequest } from "../../types";

const config = (req: ByggerRequest, res: Response) => {
  const user = appConfig.isDevelopment ? undefined : req.getUser?.();
  if (user) {
    res.header("Bygger-Formio-Token", createFormioJwt(user));
  }
  res.json({
    formioProjectUrl: appConfig.formio.projectUrl,
    fyllutBaseUrl: appConfig.fyllut.baseUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
    isDevelopment: appConfig.isDevelopment,
    user,
  });
};

export default config;
