// See the analytics taxonomy for standardized event names: https://github.com/navikt/analytics-taxonomy
export interface EventData {
  [key: string]: string | number | boolean | undefined;
}

type EventName = 'skjema fullført' | 'skjemainnsending feilet' | 'last opp';

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

type LastOppEvent = Event & {
  name: 'last opp';
  data: EventData & {
    skjemaId: string;
  };
};

export type FyllutUmamiEvent = SkjemaFullfortEvent | SkjemainnsendingFeiletEvent | LastOppEvent;
