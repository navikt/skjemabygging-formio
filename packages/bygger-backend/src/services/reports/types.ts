import { StaticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { Form, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import { DateTime } from 'luxon';
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
const formatReportTimestamp = (timestamp?: string) => {
  if (!timestamp) return undefined;
  const date = DateTime.fromISO(timestamp).toUTC();
  if (!date.isValid) throw new RangeError('Invalid report timestamp');
  return date.toFormat('yyyy-MM-dd, HH:mm');
};

export { formatReportTimestamp, formatSubmissionTypes, isNotTestForm };
export type { ReportDependencies };
