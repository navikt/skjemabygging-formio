import { NextFunction, Request, Response } from "express";
import { previewForm } from "../../migration/migrationScripts";
import formio from "../../services/formio";

const migratePreview = async (req: Request, res: Response, next: NextFunction) => {
  const searchFilters = JSON.parse((req.query["searchFilters"] as string) || "{}");
  const editOptions = JSON.parse((req.query["editOptions"] as string) || "{}");
  try {
    const { formPath } = req.params;
    const form = await formio.getForm(formPath);
    const formForPreview = await previewForm(searchFilters, editOptions, form);
    res.json(formForPreview);
  } catch (error) {
    next(error);
  }
};

export default migratePreview;
