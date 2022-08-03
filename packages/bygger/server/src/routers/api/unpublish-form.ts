import { NextFunction, Response } from "express";
import { formioService, publisherService } from "../../services";
import { ByggerRequest } from "../../types";

const deprecatedUnpublishForm = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = req.getFormioToken?.()!;
  const userName = req.getUser?.().name!;
  const { formPath } = req.params;

  try {
    const form = await formioService.getForm(formPath);
    const result = await publisherService.unpublishForm(form, { formioToken, userName });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default deprecatedUnpublishForm;
