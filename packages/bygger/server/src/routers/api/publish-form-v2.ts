import { NextFunction, Response } from "express";
import { publisherService } from "../../services";
import { ByggerRequest } from "../../types";
import { BadRequest } from "./helpers/errors";

const publishFormV2 = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = req.getFormioToken?.()!;
  const userName = req.getUser?.().name!;
  const { formPath } = req.params;
  const { form, translations } = req.body;

  if (formPath !== form.path) {
    next(new BadRequest("Path mismatch attempting to publish form"));
    return;
  }

  try {
    const result = await publisherService.publishForm(form, translations, { formioToken, userName });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default publishFormV2;
