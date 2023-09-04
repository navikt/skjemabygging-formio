import { NextFunction, Request, Response } from "express";
import { backendInstance } from "../../../services";

const publishedForms = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formPath } = req.params;
      const form = await backendInstance.fetchPublishedForm(formPath);
      return form ? res.json(form) : res.sendStatus(404);
    } catch (err) {
      next(err);
    }
  },
};

export default publishedForms;
