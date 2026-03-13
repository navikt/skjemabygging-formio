import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormCoverPageUser = (): Component => {
  return {
    type: 'navCheckbox',
    label: 'Bruk organisasjonsnummer som bruker på førsteside',
    key: 'coverPageUser',
    defaultValue: false,
    additionalDescriptionLabel: 'Hva innebærer dette?',
    additionalDescriptionText:
      'Når Dine opplysninger ikke finnes i innsendingen, brukes verdien i dette organisasjonsnummerfeltet som bruker på førstesiden.',
  };
};

export default editFormCoverPageUser;
