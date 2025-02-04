import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';

export type Status = 'PENDING' | 'DRAFT' | 'PUBLISHED' | 'UNKNOWN' | 'TESTFORM' | 'UNPUBLISHED';

export type StreetLightSize = 'small' | 'large';

export type PublishStatusProperties = Pick<Form, 'createdAt' | 'changedAt' | 'publishedAt'> &
  Pick<FormPropertiesType, 'isTestForm' | 'unpublished'>;

export type PublishProperties = PublishStatusProperties &
  Pick<Form, 'createdBy' | 'changedBy' | 'publishedBy'> &
  Pick<FormPropertiesType | 'unpublishedBy' | 'publishedLanguages'>;
