import { NextFunction, Request, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import backendInstance from "./helpers/backend-instance";

const migrateUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const { searchFilters, editOptions, include } = req.body.payload;
  try {
    const allForms = await backendInstance.getAllForms();
    const { migratedForms } = await migrateForms(searchFilters, editOptions, allForms, include);
    const migratedFormsData = await backendInstance.updateForms(req.body.token, migratedForms);
    res.send(migratedFormsData);
  } catch (error) {
    next(error);
  }
};

export default migrateUpdate;
