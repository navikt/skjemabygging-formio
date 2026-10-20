import { StaticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { dateUtils, Form, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
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
const formatSubmissionTypes = (types: SubmissionType[]) =>
  types.length ? `[${types.map((type) => JSON.stringify(type)).join(', ')}]` : '';
const formatReportTimestamp = (timestamp?: string) =>
  timestamp ? dateUtils.toJSDate(timestamp).toISOString().slice(0, 16).replace('T', ', ') : undefined;

export { formatReportTimestamp, formatSubmissionTypes, isNotTestForm };
export type { ReportDependencies };
