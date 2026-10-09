import { StaticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { Form, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPublicationsService } from '../formPublications/types';
import { FormsService } from '../forms/types';
import RecipientService from '../RecipientService';

type ReportDependencies = {
  formsService: Pick<FormsService, 'getAll' | 'get'>;
  formPublicationsService: Pick<FormPublicationsService, 'getAll' | 'get' | 'getTranslations'>;
  recipientService: Pick<RecipientService, 'getAll'>;
  staticPdfService: Pick<StaticPdfService, 'getAll'>;
};

const isNotTestForm = (form: Partial<Form>) => !form.properties?.isTestForm;
const formatSubmissionTypes = (types: SubmissionType[]) => `[${types.map((type) => JSON.stringify(type)).join(', ')}]`;

export { formatSubmissionTypes, isNotTestForm };
export type { ReportDependencies };
