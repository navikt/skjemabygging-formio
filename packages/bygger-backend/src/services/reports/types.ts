import { StaticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPublicationsService } from '../formPublications/types';
import { FormsService } from '../forms/types';
import RecipientService from '../RecipientService';

type ReportDependencies = {
  formsService: Pick<FormsService, 'getAll' | 'get'>;
  formPublicationsService: Pick<FormPublicationsService, 'getAll' | 'getTranslations'>;
  recipientService: Pick<RecipientService, 'getAll'>;
  staticPdfService: Pick<StaticPdfService, 'getAll'>;
};

const notTestForm = (form: Partial<Form>) => !form.properties?.isTestForm;
const yesNo = (value: unknown) => (value ? 'ja' : 'nei');

export { notTestForm, yesNo };
export type { ReportDependencies };
