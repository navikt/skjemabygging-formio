import { NextFunction, Request, Response } from "express";
import formio from "../../services/formio";
import { generateNavFormDiff } from "../../util/formDiffingTool";
import backendInstance from "./helpers/backend-instance";
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

    const form = await formio.getForm(formPath);

    res.json(generateNavFormDiff(publishedForm, form));
  } catch (error) {
    next(error);
  }
};

const notFound = (next: NextFunction) => {
  return next(new NotFoundError("Published form not found"));
};

export default formDiff;
