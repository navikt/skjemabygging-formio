import { NextFunction, Request, Response } from "express";
import { backendInstance } from "../../services";

const deprecatedPublishForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;
    const result = await backendInstance.publishForm(req.body.form, req.body.translations, formPath);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(error);
  }
};

export default deprecatedPublishForm;
