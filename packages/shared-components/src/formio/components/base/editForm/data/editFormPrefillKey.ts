import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  prefillKey?: string;
}

const editFormPrefillKey = (options: PropertyOptions): Component => {
  return {
    components: [
      {
        type: 'checkbox',
        label: 'Preutfylling',
        description:
          'Gjør automatisk oppslag mot PDL for å preutfylle data vi har om brukeren. Forhåndsvisning vil vise oppsett for papirinnsending. Bruk skjemadelingslenke under innstillinger for å teste digital innsending med testbruker fra Dolly.',
        key: 'prefill',
        defaultValue: false,
      },
      {
        type: 'hidden',
        key: 'prefillKey',
        defaultValue: options.prefillKey,
        clearOnHide: true,
        customConditional: 'show = row.prefill',
      },
    ],
  } as Component;
};

export default editFormPrefillKey;
