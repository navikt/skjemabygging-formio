const utlandBygningSchema = (keyPostfix = '') => ({
  label: 'Bygning',
  type: 'textfield',
  key: `bygning${keyPostfix}`,
  fieldSize: 'input--xxl',
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default utlandBygningSchema;
