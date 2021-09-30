const telefonSchema = (keyPostfix = "") => ({
  label: "Telefonnummer",
  type: "phoneNumber",
  key: `telefonnummer${keyPostfix}`,
  fieldSize: "input--s",
  input: true,
  dataGridLabel: true,
  inputMask: false,
  spellcheck: false,
  autocomplete: "tel",
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
});

export default telefonSchema;