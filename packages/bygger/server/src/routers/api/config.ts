import { Request, Response } from "express";
import appConfig from "../../config";

const config = (req: Request, res: Response) => {
  res.json({
    formioProjectUrl: appConfig.formio.projectUrl,
    fyllutBaseUrl: appConfig.fyllut.baseUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
  });
};

export default config;
