import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';

// Upstream field names from innsending-api
type UpstreamActiveTask = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  soknadstype: 'soknad' | 'ettersendelse';
};

type ActiveTask = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  soknadstype: 'soknad' | 'ettersendelse';
};

export type { ActiveTask, SendInnAktivitet, UpstreamActiveTask };
