const ibanSchema = () => ({
  label: "IBAN",
  type: "iban",
  key: `iban`,
  fieldSize: "input--l",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    custom: "valid = instance.validateIban(input);",
    required: true,
  },
});

export default ibanSchema;
