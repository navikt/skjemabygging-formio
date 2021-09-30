import { addPrefixOrPostfix } from "../../../util/text-util";

const coAdresseSchema = (keyPrefix, keyPostfix = "") => ({
  label: "C/O",
  type: "textfield",
  key: addPrefixOrPostfix("co", keyPrefix, keyPostfix),
  fieldSize: "input--xxl",
  autocomplete: false,
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

export default coAdresseSchema;