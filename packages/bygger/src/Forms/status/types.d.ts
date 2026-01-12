import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';

export type Status = 'PENDING' | 'DRAFT' | 'PUBLISHED' | 'UNKNOWN' | 'TESTFORM' | 'UNPUBLISHED';

export type StreetLightSize = 'small' | 'large';

type FormPropertiesIsTestForm = Pick<FormPropertiesType, 'isTestForm'>;

export type FormStatusProperties = Pick<
  Form,
  'changedAt' | 'changedBy' | 'publishedAt' | 'publishedBy' | 'publishedLanguages' | 'revision' | 'status'
> & { properties?: FormPropertiesIsTestForm };

export type TimestampEvent = { timestamp: string; userName: string | undefined };
