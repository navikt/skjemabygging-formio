import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';

export type Status = 'PENDING' | 'DRAFT' | 'PUBLISHED' | 'UNKNOWN' | 'TESTFORM' | 'UNPUBLISHED';

export type StreetLightSize = 'small' | 'large';

export type FormStatusEvents = Pick<Form, 'createdAt' | 'changedAt' | 'publishedAt' | 'status'> &
  Pick<FormPropertiesType, 'isTestForm'>;

export type FormStatusProperties = FormStatusEvents &
  Pick<Form, 'createdBy' | 'changedBy' | 'publishedBy' | 'publishedLanguages'>;
