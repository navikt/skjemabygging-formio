import { formService } from '@navikt/skjemadigitalisering-shared-backend';
import { Form, formioFormsApiUtils, NavFormType, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';

const formSelect = ['skjemanummer', 'path', 'title', 'components', 'properties'] as const satisfies Array<keyof Form>;

const loadNavForm = async (formPath: string): Promise<NavFormType | undefined> => {
  try {
    const form = await formService.getForm({
      baseUrl: config.formsApiUrl,
      formPath,
      select: formSelect,
      formsApiStaging: config.useFormsApiStaging,
      formsLocation: config.skjemaDir,
      mocksEnabled: config.mocksEnabled,
    });

    return formioFormsApiUtils.mapFormToNavForm(form);
  } catch (error) {
    if (error instanceof ResponseError && error.errorCode === 'NOT_FOUND') {
      return undefined;
    }

    throw error;
  }
};

export { loadNavForm };
