import { formioFormsApiUtils, MigrationLevel } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { previewForm } from '../../migration/migrationScripts';
import { formsService } from '../../services';

const migratePreview = async (req: Request, res: Response, next: NextFunction) => {
  const formSearchFilters: object = JSON.parse((req.query['formSearchFilters'] as string) || '{}');
  const searchFilters: object = JSON.parse((req.query['searchFilters'] as string) || '{}');
  const dependencyFilters: object = JSON.parse((req.query['dependencyFilters'] as string) || '{}');
  const editOptions: object = JSON.parse((req.query['editOptions'] as string) || '{}');
  const migrationLevel: MigrationLevel = req.query['migrationLevel'] as MigrationLevel;
  try {
    const { formPath } = req.params;
    const form = formioFormsApiUtils.mapFormToNavForm(await formsService.get(formPath));

    const formForPreview = await previewForm(
      formSearchFilters,
      searchFilters,
      dependencyFilters,
      editOptions,
      form!,
      migrationLevel,
    );
    res.json(formForPreview);
  } catch (error) {
    next(error);
  }
};

export default migratePreview;
