const borDuINorgeSchema = (keyPostfix = '') => ({
  label: 'Bor du i Norge?',
  type: 'radiopanel',
  key: `borDuINorge${keyPostfix}`,
  input: true,
  validateOn: 'blur',
  validate: {
    required: true,
  },
  values: [
    {
      value: 'ja',
      label: 'Ja',
    },
    {
      value: 'nei',
      label: 'Nei',
    },
  ],
});

export default borDuINorgeSchema;
