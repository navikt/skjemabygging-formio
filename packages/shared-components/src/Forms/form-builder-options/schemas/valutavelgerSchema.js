const valutavelgerSchema = () => ({
  label: "Velg valuta",
  type: "valutavelger",
  key: "valutavelger",
  fieldSize: "input--s",
  input: true,
  clearOnHide: true,
  validateOn: "blur",
  data: {
    url: "http://localhost:8081/fyllut/api/currencies?lang=nb",
  },
  dataSrc: "url",
  disableLimit: true,
  validate: {
    required: true,
  },
});

export default valutavelgerSchema;
