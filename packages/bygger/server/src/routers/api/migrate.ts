import { NextFunction, Request, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import backendInstance from "./helpers/backend-instance";

const migrate = async (req: Request, res: Response, next: NextFunction) => {
  const searchFilters = JSON.parse((req.query["searchFilters"] as string) || "{}");
  const editOptions = JSON.parse((req.query["editOptions"] as string) || "{}");
  try {
    const allForms = await backendInstance.getAllForms();
    const { log } = await migrateForms(searchFilters, editOptions, allForms);
    res.send(log);
  } catch (error) {
    next(error);
  }
};

export default migrate;
