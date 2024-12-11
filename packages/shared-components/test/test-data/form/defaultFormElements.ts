const defaultVedleggValues = [
  {
    value: 'leggerVedNaa',
    label: 'Jeg legger det ved denne søknaden (anbefalt)',
    shortcut: '',
  },
  {
    value: 'ettersender',
    label:
      'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
    shortcut: '',
  },
  {
    value: 'levertTidligere',
    label: 'Jeg har levert denne dokumentasjonen tidligere',
    shortcut: '',
  },
];

const radiopanelJaNei = [
  {
    value: 'ja',
    label: 'Ja',
    shortcut: '',
  },
  {
    value: 'nei',
    label: 'Nei',
    shortcut: '',
  },
];

const borDuINorgeRadiopanel = {
  label: 'Bor du i Norge?',
  key: 'borDuINorge',
  type: 'radiopanel',
  input: true,
  inputType: 'radio',
  id: 'efx5jas',
  values: radiopanelJaNei,
};

const panelForsteSide = {
  type: 'panel',
  key: 'forsteSide',
  title: 'Første side',
};

const panelVedleggsliste = {
  type: 'panel',
  key: 'vedleggpanel',
  title: 'Vedleggsliste',
};

const vedleggBekreftelseBostedsadresse = {
  type: 'radiopanel',
  label: 'Bekreftelse på bostedsadresse i utlandet',
  input: true,
  inputType: 'radio',
  values: defaultVedleggValues,
  key: 'bekreftelsePaBostedsadresseIUtlandet',
  properties: {
    vedleggstittel: 'Bekreftelse på utenlandsk bostedsadresse',
    vedleggskode: 'U1',
  },
  conditional: {
    json: '',
    show: null,
    when: null,
    eq: '',
  },
  customConditional: '',
};

export {
  borDuINorgeRadiopanel,
  defaultVedleggValues,
  panelForsteSide,
  panelVedleggsliste,
  radiopanelJaNei,
  vedleggBekreftelseBostedsadresse,
};
