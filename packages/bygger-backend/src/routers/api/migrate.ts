import { NextFunction, Request, Response } from 'express';
import { migrateForms } from '../../migration/migrationScripts';
import { formioService } from '../../services';

const migrate = async (req: Request, res: Response, next: NextFunction) => {
  const searchFilters: object = JSON.parse((req.query['searchFilters'] as string) || '{}');
  const dependencyFilters: object = JSON.parse((req.query['dependencyFilters'] as string) || '{}');
  const editOptions: object = JSON.parse((req.query['editOptions'] as string) || '{}');
  try {
    if (Object.keys({ ...searchFilters, ...dependencyFilters }).length === 0)
      throw new Error('Migreringen mangler søkefiltre');
    const allForms = await formioService.getAllForms();
    const { log } = await migrateForms(searchFilters, dependencyFilters, editOptions, allForms);
    res.send(log);
  } catch (error) {
    next(error);
  }
};

export default migrate;
