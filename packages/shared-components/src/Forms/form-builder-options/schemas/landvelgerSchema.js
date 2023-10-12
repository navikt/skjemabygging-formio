const landvelgerSchema = () => ({
  label: 'Velg land',
  type: 'landvelger',
  key: 'landvelger',
  input: true,
  clearOnHide: true,
  validateOn: 'blur',
  dataGridLabel: true,
  fieldSize: 'input--xxl',
  data: {
    url: 'https://www.nav.no/fyllut/countries?lang=nb',
  },
  dataSrc: 'url',
  disableLimit: true,
  validate: {
    required: true,
  },
});

export default landvelgerSchema;
