import { NextFunction, Request, Response } from 'express';
import { backendInstance } from '../../services';

const deprecatedUnpublishForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formPath } = req.params;
    const result = await backendInstance.unpublishForm(formPath);
    res.json({ changed: !!result, result });
  } catch (error) {
    next(error);
  }
};

export default deprecatedUnpublishForm;
