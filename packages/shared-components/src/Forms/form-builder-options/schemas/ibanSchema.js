const ibanSchema = () => ({
  label: "IBAN",
  type: "iban",
  key: `iban`,
  fieldSize: "input--m",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.validateIban(input) ? true : 'Dette er ikke et gyldig IBAN kontonummer';",
    required: true,
  },
});

export default ibanSchema;
