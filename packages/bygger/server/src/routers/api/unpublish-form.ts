import { NextFunction, Request, Response } from "express";
import { getFormioToken } from "../../util/requestTool";
import backendInstance from "./helpers/backend-instance";

const unpublishForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;
    const result = await backendInstance.unpublishForm(getFormioToken(req), formPath);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(error);
  }
};

export default unpublishForm;
