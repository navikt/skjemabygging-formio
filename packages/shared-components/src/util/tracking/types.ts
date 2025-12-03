// See the analytics taxonomy for standardized event names: https://github.com/navikt/analytics-taxonomy
interface EventData {
  language?: string;
  submissionMethod?: string;
  [key: string]: string | number | boolean | undefined;
}

type EventName =
  | 'skjema fullført'
  | 'skjemainnsending feilet'
  | 'skjema slettet'
  | 'last opp'
  | 'last ned'
  | 'sesjon utløpt'
  | 'skjema restartet';

type Event = {
  name: EventName;
  data: EventData;
};

type SkjemaFullfortEvent = Event & {
  name: 'skjema fullført';
  data: EventData & {
    skjemaId: string;
    skjemanavn: string;
    tema: string;
  };
};

type SkjemainnsendingFeiletEvent = Event & {
  name: 'skjemainnsending feilet';
  data: EventData & {
    skjemaId: string;
    skjemanavn: string;
    tema: string;
  };
};

type SkjemaSlettetEvent = Event & {
  name: 'skjema slettet';
  data: EventData & {
    skjemaId: string;
    skjemanavn: string;
    tema: string;
  };
};

type LastOppEvent = Event & {
  name: 'last opp';
  data: EventData & {
    type: string;
    tema: string;
    tittel: string;
    skjemaId: string;
  };
};

type LastNedEvent = Event & {
  name: 'last ned';
  data: EventData & {
    type: string;
    tema: string;
    tittel: string;
    skjemaId: string;
  };
};

type SesjonUtlopt = Event & {
  name: 'sesjon utløpt';
  data: EventData & {
    skjemaId: string;
    skjemanavn: string;
    tema: string;
  };
};

type SkjemaRestartet = Event & {
  name: 'skjema restartet';
  data: EventData & {
    skjemaId: string;
    skjemaPath: string;
  };
};

export type FyllutUmamiEvent =
  | SkjemaFullfortEvent
  | SkjemainnsendingFeiletEvent
  | SkjemaSlettetEvent
  | LastOppEvent
  | LastNedEvent
  | SesjonUtlopt
  | SkjemaRestartet;
