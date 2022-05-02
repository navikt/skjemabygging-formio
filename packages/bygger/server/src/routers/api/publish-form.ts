import { NextFunction, Request, Response } from "express";
import backendInstance from "./helpers/backend-instance";

const publishForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;
    const result = await backendInstance.publishForm(req.body.token, req.body.form, req.body.translations, formPath);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(error);
  }
};

export default publishForm;
