const statsborgerskapSchema = (keyPostfix = "") => ({
  label: "Statsborgerskap",
  type: "textfield",
  key: `statsborgerskap${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
});

export default statsborgerskapSchema;