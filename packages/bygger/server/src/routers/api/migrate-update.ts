import { NextFunction, Request, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import formio from "../../services/formio";
import { getFormioToken } from "../../util/requestTool";

const migrateUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const { searchFilters, editOptions, include } = req.body.payload;
  try {
    const allForms = await formio.getAllForms();
    const { migratedForms } = await migrateForms(searchFilters, editOptions, allForms, include);
    const migratedFormsData = await formio.updateForms(getFormioToken(req), migratedForms);
    res.send(migratedFormsData);
  } catch (error) {
    next(error);
  }
};

export default migrateUpdate;
