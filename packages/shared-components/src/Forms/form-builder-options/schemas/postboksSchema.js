const postboksSchema = (keyPostfix = "") => ({
  label: "Postboks",
  type: "textfield",
  key: `postboksNr${keyPostfix}`,
  fieldSize: "input--s",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

export default postboksSchema;