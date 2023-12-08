import datepickerBuilder from '../../components/core/datepicker/Datepicker.builder';

const datoOgTidPalett = {
  title: 'Dato og tid',
  components: {
    datetime: null,
    datoVelger: datepickerBuilder(),
    time: {
      title: 'Klokke',
      key: 'klokke',
      icon: 'clock-o',
      weight: 20,
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
    },
    day: {
      title: 'Mnd / år',
      key: 'manedAr',
      icon: 'calendar',
      weight: 40,
      schema: {
        label: 'Mnd / år',
        type: 'day',
        key: 'manedAr',
        input: true,
        dataGridLabel: true,
        fieldSize: 'input--s',
        clearOnHide: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
        fields: {
          day: {
            fieldSize: 'input--s',
            required: false,
            hide: true,
          },
          month: {
            fieldSize: 'input--s',
            type: 'select',
            placeholder: 'Måned',
            required: true,
          },
          year: {
            fieldSize: 'input--s',
            type: 'number',
            placeholder: 'År',
            required: true,
          },
        },
      },
    },
  },
};

export default datoOgTidPalett;
