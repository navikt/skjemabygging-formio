import { NextFunction, Request, Response } from "express";
import { getFormioToken } from "../../util/requestTool";
import backendInstance from "./helpers/backend-instance";
import { ApiError, BadRequest } from "./helpers/errors";

const ALLOWED_RESOURCES = [/^mottaksadresser$/, /^global-translations-([a-z]{2}(-NO)?)$/];
export const isValidResource = (resourceName: string) => {
  return ALLOWED_RESOURCES.some((regex) => regex.test(resourceName));
};

const publishResource = async (req: Request, res: Response, next: NextFunction) => {
  const { resourceName } = req.params;
  if (!isValidResource(resourceName)) {
    next(new BadRequest(`Illegal resourceName: ${resourceName}`));
    return;
  }
  try {
    const result = await backendInstance.publishResource(getFormioToken(req), resourceName, req.body.resource);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(new ApiError("Publisering feilet", true, error as Error));
  }
};

export default publishResource;
