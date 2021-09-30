const utlandRegionSchema = (keyPostfix = "") => ({
  label: "Region",
  type: "textfield",
  key: `utlandRegion${keyPostfix}`,
  autocomplete: "address-level1",
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

export default utlandRegionSchema;