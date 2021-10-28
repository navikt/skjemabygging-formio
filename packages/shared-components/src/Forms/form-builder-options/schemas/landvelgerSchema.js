const landvelgerSchema = () => ({
  label: "Velg land",
  type: "landvelger",
  key: "landvelger",
  input: true,
  clearOnHide: true,
  validateOn: "blur",
  data: {
    url: "https://www.nav.no/fyllut/countries?lang=nb",
  },
  dataSrc: "url",
  valueProperty: "label",
  disableLimit: true,
  validate: {
    required: true,
  },
});

export default landvelgerSchema;