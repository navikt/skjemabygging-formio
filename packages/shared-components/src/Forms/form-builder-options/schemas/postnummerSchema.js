const postnummerSchema = (keyPostfix = "") => ({
  label: "Postnummer",
  type: "textfield",
  key: `postnr${keyPostfix}`,
  autocomplete: "postal-code",
  spellcheck: false,
  fieldSize: "input--xs",
  validate: {
    required: true,
    minLength: 4,
    maxLength: 4,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

export default postnummerSchema;