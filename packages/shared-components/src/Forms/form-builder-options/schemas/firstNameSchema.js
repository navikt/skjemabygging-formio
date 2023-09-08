const firstNameSchema = (keyPostfix = "") => ({
  label: "Fornavn",
  type: "textfield",
  key: `fornavn${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  clearOnHide: true,
  autocomplete: "given-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
});

export default firstNameSchema;
