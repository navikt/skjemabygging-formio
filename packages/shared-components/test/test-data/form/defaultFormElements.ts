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
  type: 'attachment',
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

const vedleggAnnenDokumentasjon = {
  label: 'Annen dokumentasjon',
  description: 'Har du annen dokumentasjon du ønsker å legge ved?',
  additionalDescription: false,
  validate: {
    required: true,
    onlyAvailableItems: false,
  },
  key: 'annenDokumentasjon',
  properties: {
    vedleggstittel: 'Annet',
    vedleggskode: 'N6',
  },
  type: 'attachment',
  optionsLabelPosition: 'right',
  inline: false,
  tableView: false,
  input: true,
  isAttachmentPanel: false,
  navId: 'eud0gda',
  inputType: 'radio',
  fieldSet: false,
  attachmentType: 'other',
  attachmentValues: {
    leggerVedNaa: {
      enabled: true,
    },
    nei: {
      enabled: true,
    },
  },
};

export {
  borDuINorgeRadiopanel,
  defaultVedleggValues,
  panelForsteSide,
  panelVedleggsliste,
  radiopanelJaNei,
  vedleggAnnenDokumentasjon,
  vedleggBekreftelseBostedsadresse,
};
