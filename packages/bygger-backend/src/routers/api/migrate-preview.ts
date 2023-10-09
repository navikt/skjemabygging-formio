import { NextFunction, Request, Response } from 'express';
import { previewForm } from '../../migration/migrationScripts';
import { formioService } from '../../services';

const migratePreview = async (req: Request, res: Response, next: NextFunction) => {
  const searchFilters = JSON.parse((req.query['searchFilters'] as string) || '{}');
  const dependencyFilters = JSON.parse((req.query['dependencyFilters'] as string) || '{}');
  const editOptions = JSON.parse((req.query['editOptions'] as string) || '{}');
  try {
    const { formPath } = req.params;
    const form = await formioService.getForm(formPath);
    const formForPreview = await previewForm(searchFilters, dependencyFilters, editOptions, form);
    res.json(formForPreview);
  } catch (error) {
    next(error);
  }
};

export default migratePreview;
