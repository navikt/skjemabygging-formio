import { NextFunction, Request, Response } from "express";
import { generateNavFormDiff } from "../../util/formDiffingTool";
import backendInstance from "./helpers/backend-instance";
import { NotFoundError } from "./helpers/errors";

const formDiff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;

    let publishedForm;
    try {
      publishedForm = await backendInstance.fetchPublishedForm(formPath);
    } catch (e) {
      return next(new NotFoundError("Published form not found"));
    }

    const form = await backendInstance.getForm(formPath);

    res.json(generateNavFormDiff(publishedForm, form));
  } catch (error) {
    next(error);
  }
};

export default formDiff;
