import { NextFunction, Response } from "express";
import { formioService, publisherService } from "../../services";
import { ByggerRequest } from "../../types";
import { BadRequest } from "./helpers/errors";

const publishForms = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = req.getFormioToken?.()!;
  const userName = req.getUser?.().name!;
  const { formPaths } = req.body.payload;

  if (!Array.isArray(formPaths) || formPaths.length === 0) {
    next(new BadRequest("Request is missing formPaths"));
    return;
  }
  try {
    const forms = await formioService.getForms(formPaths);
    const gitSha = await publisherService.publishForms(forms, { formioToken, userName });
    res.json({ changed: !!gitSha, gitSha });
  } catch (error) {
    next(error);
  }
};

export default publishForms;
