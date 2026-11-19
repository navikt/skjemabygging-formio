import { http } from '@navikt/skjemadigitalisering-shared-frontend';

type SendinnHttp = Pick<typeof http, 'get'>;

export type { SendinnHttp };
