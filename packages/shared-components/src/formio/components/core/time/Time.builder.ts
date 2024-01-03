const timeBuilder = () => {
  return {
    title: 'Klokke',
    group: 'datoOgTid',
    schema: {
      label: 'Klokkeslett (tt:mm)',
      type: 'textfield',
      key: 'tid',
      fieldSize: 'input--xs',
      input: true,
      dataGridLabel: true,
      spellcheck: false,
      clearOnHide: true,
      validateOn: 'blur',
      validate: {
        required: true,
        pattern: '([0-1][0-9]|2[0-3]):[0-5][0-9]',
        customMessage: 'Klokkeslett må være på formatet tt:mm, f.eks. 12:30.',
      },
    },
  };
};

export default timeBuilder;