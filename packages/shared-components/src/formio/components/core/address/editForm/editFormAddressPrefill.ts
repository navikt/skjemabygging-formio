import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  customConditional?: string;
}

const editFormAddressPrefill = (options: PropertyOptions): Component => {
  return {
    type: 'radiopanel',
    label: 'Adresse prioritet',
    description:
      'Velg hvilken adresse man skal prioritere ved henting fra PDL. ' +
      'Hvis man ikke finner valgt adresse, prøver vi hente adressene i følgene rekkefølge: bosted, opphold og kontakt.',
    key: 'addressPriority',
    defaultValue: 'bosted',
    values: [
      {
        value: 'bosted',
        label: 'Bosted',
      },
      {
        value: 'opphold',
        label: 'Opphold',
      },
      {
        value: 'kontakt',
        label: 'Kontakt',
      },
    ],
    validate: {
      required: true,
    },
    clearOnHide: true,
    customConditional: options.customConditional,
  };
};

export default editFormAddressPrefill;
