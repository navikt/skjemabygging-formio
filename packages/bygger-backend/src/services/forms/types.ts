import { Form } from '@navikt/skjemadigitalisering-shared-domain';

type FormPostBody = Pick<Form, 'skjemanummer' | 'title' | 'components' | 'properties'>;
type FormPutBody = Pick<Form, 'title' | 'components' | 'properties'>;

export type { FormPostBody, FormPutBody };
