const utlandLandSchema = (keyPostfix = '') => ({
  label: 'Land',
  type: 'textfield',
  key: `land${keyPostfix}`,
  autocomplete: 'country-name',
  fieldSize: 'input--xxl',
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default utlandLandSchema;
