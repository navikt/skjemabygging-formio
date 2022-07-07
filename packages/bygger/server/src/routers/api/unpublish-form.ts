import { NextFunction, Request, Response } from "express";
import { backendInstance } from "../../services";
import { getFormioToken } from "../../util/requestTool";

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
