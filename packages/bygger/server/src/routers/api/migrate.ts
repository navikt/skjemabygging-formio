import { NextFunction, Request, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import formio from "../../services/formio";

const migrate = async (req: Request, res: Response, next: NextFunction) => {
  const searchFilters = JSON.parse((req.query["searchFilters"] as string) || "{}");
  const editOptions = JSON.parse((req.query["editOptions"] as string) || "{}");
  try {
    const allForms = await formio.getAllForms();
    const { log } = await migrateForms(searchFilters, editOptions, allForms);
    res.send(log);
  } catch (error) {
    next(error);
  }
};

export default migrate;
