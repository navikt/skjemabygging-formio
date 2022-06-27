import { NextFunction, Request, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import formioService from "../../services/formioService";
import { getFormioToken } from "../../util/requestTool";

const migrateUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const { searchFilters, editOptions, include } = req.body.payload;
  try {
    const allForms = await formioService.getAllForms();
    const { migratedForms } = await migrateForms(searchFilters, editOptions, allForms, include);
    const migratedFormsData = await formioService.updateForms(getFormioToken(req), migratedForms);
    res.send(migratedFormsData);
  } catch (error) {
    next(error);
  }
};

export default migrateUpdate;
