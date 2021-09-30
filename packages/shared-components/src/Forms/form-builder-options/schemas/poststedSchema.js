import {addPrefixOrPostfix} from "../../../util/text-util";

const poststedSchema = (keyPrefix, keyPostfix = "") => ({
  label: "Poststed",
  type: "textfield",
  key: addPrefixOrPostfix("poststed", keyPrefix, keyPostfix),
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

export default poststedSchema;