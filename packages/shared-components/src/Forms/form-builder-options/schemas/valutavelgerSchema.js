const valutavelgerSchema = () => ({
  label: "Velg valuta",
  type: "valutavelger",
  key: "valutavelger",
  fieldSize: "input--m",
  input: true,
  clearOnHide: true,
  validateOn: "blur",
  data: {
    url: "https://www.nav.no/fyllut/api/common-codes/currencies?lang=nb",
  },
  dataSrc: "url",
  disableLimit: true,
  validate: {
    required: true,
  },
});

export default valutavelgerSchema;
