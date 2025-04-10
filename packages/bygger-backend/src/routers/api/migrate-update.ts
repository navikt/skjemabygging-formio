import { Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Response } from 'express';
import { migrateForms } from '../../migration/migrationScripts';
import { formsService } from '../../services';
import { FormPutBody } from '../../services/forms/types';
import { ByggerRequest } from '../../types';

const migrateUpdate = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const { formSearchFilters, searchFilters, dependencyFilters, editOptions, include, migrationLevel } =
    req.body.payload;
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    const allForms: NavFormType[] = [];
    const allFormsApiForms = await formsService.getAll<Pick<Form, 'path'>>('path');
    for (const form of allFormsApiForms) {
      const formsApiForm = await formsService.get(form.path);
      allForms.push(formioFormsApiUtils.mapFormToNavForm(formsApiForm));
    }
    const { migratedForms } = await migrateForms(
      formSearchFilters,
      searchFilters,
      dependencyFilters,
      editOptions,
      allForms,
      include,
      migrationLevel,
    );
    const migratedFormsData: Form[] = [];
    for (const navForm of migratedForms) {
      const body: FormPutBody = {
        title: navForm.title,
        components: navForm.components,
        properties: navForm.properties,
      };
      const formsApiForm = await formsService.put(navForm.path, body, navForm.revision!, accessToken);
      migratedFormsData.push(formsApiForm);
    }
    res.send(migratedFormsData);
  } catch (error) {
    next(error);
  }
};

export default migrateUpdate;
