const utlandByStedSchema = (keyPostfix = "") => ({
  label: "By / stedsnavn",
  type: "textfield",
  key: `poststed${keyPostfix}`,
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

export default utlandByStedSchema;