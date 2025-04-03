import { Form, MigrationLevel, NavFormType, formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { migrateForms } from '../../migration/migrationScripts';
import { formsService } from '../../services';

const migrate = async (req: Request, res: Response, next: NextFunction) => {
  const formSearchFilters: object = JSON.parse((req.query['formSearchFilters'] as string) || '{}');
  const searchFilters: object = JSON.parse((req.query['searchFilters'] as string) || '{}');
  const dependencyFilters: object = JSON.parse((req.query['dependencyFilters'] as string) || '{}');
  const editOptions: object = JSON.parse((req.query['editOptions'] as string) || '{}');
  const migrationLevel: MigrationLevel = req.query['migrationLevel'] as MigrationLevel;
  try {
    if (Object.keys({ ...formSearchFilters, ...searchFilters, ...dependencyFilters }).length === 0)
      throw new Error('Migreringen mangler søkefiltre');
    const allForms: NavFormType[] = [];
    const allFormsApiForms = await formsService.getAll<Pick<Form, 'path'>>('path');
    for (const form of allFormsApiForms) {
      const formsApiForm = await formsService.get(form.path);
      allForms.push(formioFormsApiUtils.mapFormToNavForm(formsApiForm));
    }
    const { log } = await migrateForms(
      formSearchFilters,
      searchFilters,
      dependencyFilters,
      editOptions,
      allForms,
      undefined,
      migrationLevel,
    );
    res.send(log);
  } catch (error) {
    next(error);
  }
};

export default migrate;
