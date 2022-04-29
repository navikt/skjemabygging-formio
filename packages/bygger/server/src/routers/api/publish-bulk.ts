import { NextFunction, Request, Response } from "express";
import backendInstance from "./helpers/backend-instance";

const publishBulk = async (req: Request, res: Response, next: NextFunction) => {
  if (!Array.isArray(req.body.payload.formPaths) || req.body.payload.formPaths.length === 0) {
    res.status(400).send("Request is missing formPaths");
  }
  try {
    const result = await backendInstance.bulkPublishForms(req.body.token, req.body.payload.formPaths);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(error);
  }
};

export default publishBulk;
