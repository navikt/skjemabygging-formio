const surnameSchema = (keyPostfix = "") => ({
  label: "Etternavn",
  type: "textfield",
  key: `etternavn${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  clearOnHide: true,
  autocomplete: "family-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
});

export default surnameSchema;