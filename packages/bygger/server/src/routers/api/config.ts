import { Response } from "express";
import jwt from "jsonwebtoken";
import appConfig from "../../config";
import { ByggerRequest } from "../../types";

const config = (req: ByggerRequest, res: Response) => {
  const { formio } = appConfig;
  const user = req.getUser?.();
  if (user) {
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
    res.header("Bygger-Formio-Token", jwt.sign(tokenPayload, formio.jwtSecret, { expiresIn: "8h" }));
  }
  res.json({
    formioProjectUrl: appConfig.formio.projectUrl,
    fyllutBaseUrl: appConfig.fyllut.baseUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
    user,
  });
};

export default config;
