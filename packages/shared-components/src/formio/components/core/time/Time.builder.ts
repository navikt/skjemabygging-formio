const timeBuilder = () => {
  return {
    title: 'Klokke',
    schema: {
      label: 'Klokkeslett (tt:mm)',
      type: 'textfield',
      key: 'tid',
      fieldSize: 'input--xs',
      spellcheck: false,
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
