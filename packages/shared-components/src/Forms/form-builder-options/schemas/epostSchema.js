const epostSchema = () => ({
  label: "E-post",
  type: "email",
  key: `epost`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  autocomplete: "email",
  clearOnHide: true,
  spellcheck: false,
  validate: {
    required: true,
  },
});

export default epostSchema;
