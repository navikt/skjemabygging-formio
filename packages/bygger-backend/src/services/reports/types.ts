import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPublicationsService } from '../formPublications/types';
import { FormsService } from '../forms/types';

type ReportDependencies = {
  formsService: Pick<FormsService, 'getAll' | 'get'>;
  formPublicationsService: Pick<FormPublicationsService, 'getAll' | 'getTranslations'>;
};

const notTestForm = (form: Partial<Form>) => !form.properties?.isTestForm;
const yesNo = (value: unknown) => (value ? 'ja' : 'nei');

export { notTestForm, yesNo };
export type { ReportDependencies };
