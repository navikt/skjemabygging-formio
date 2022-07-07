import { NextFunction, Request, Response } from "express";
import { backendInstance, formioService } from "../../services";
import { generateNavFormDiff } from "../../util/formDiffingTool";
import { NotFoundError } from "./helpers/errors";

const formDiff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;
    let publishedForm;
    try {
      publishedForm = await backendInstance.fetchPublishedForm(formPath);

      if (!publishedForm) {
        return notFound(next);
      }
    } catch (e) {
      return notFound(next);
    }

    const form = await formioService.getForm(formPath);

    res.json(generateNavFormDiff(publishedForm, form));
  } catch (error) {
    next(error);
  }
};

const notFound = (next: NextFunction) => {
  return next(new NotFoundError("Published form not found"));
};

export default formDiff;
