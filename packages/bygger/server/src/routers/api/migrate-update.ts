import { NextFunction, Response } from "express";
import { migrateForms } from "../../migration/migrationScripts";
import formioService from "../../services/formioService";
import { ByggerRequest } from "../../types";

const migrateUpdate = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const { searchFilters, editOptions, include } = req.body.payload;
  const formioToken = req.getFormioToken?.()!;
  const userName = req.getUser?.().name!;
  try {
    const allForms = await formioService.getAllForms();
    const { migratedForms } = await migrateForms(searchFilters, editOptions, allForms, include);
    const migratedFormsData = await formioService.saveForms(migratedForms, formioToken, userName);
    res.send(migratedFormsData);
  } catch (error) {
    next(error);
  }
};

export default migrateUpdate;
