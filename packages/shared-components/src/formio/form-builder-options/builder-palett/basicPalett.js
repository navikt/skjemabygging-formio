import TextField from '../../components/core/textfield/TextField';

const basicPalett = {
  title: 'Standard felter',
  default: false,
  components: {
    checkbox: null,
    radio: null,
    textArea: null,
    textfield: TextField.builderInfo,
    textarea: {
      title: 'Tekstområde',
      key: 'textarea',
      icon: 'font',
      schema: {
        label: 'Tekstområde',
        type: 'textarea',
        key: 'textarea',
        fieldSize: 'input--xxl',
        input: true,
        dataGridLabel: true,
        clearOnHide: true,
        validateOn: 'blur',
        autoExpand: true,
        validate: {
          required: true,
        },
      },
    },
    number: {
      title: 'Tall',
      key: 'number',
      icon: 'hashtag',
      schema: {
        label: 'Tall',
        type: 'number',
        key: 'number',
        fieldSize: 'input--m',
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        clearOnHide: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
      },
    },
    prosent: {
      title: 'Prosent',
      key: 'prosent',
      icon: 'percent',
      schema: {
        label: 'Prosent',
        type: 'number',
        key: 'prosent',
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        clearOnHide: true,
        suffix: '%',
        fieldSize: 'input--xs',
        validateOn: 'blur',
        validate: {
          required: true,
          min: 0,
          max: 100,
        },
      },
    },
    navCheckbox: {
      title: 'Avkryssingsboks',
      key: 'Avkryssingsboks',
      icon: 'check-square',
      group: 'basic',
      documentation: '',
      weight: 0,
      schema: {
        label: 'Avkryssingsboks',
        type: 'navCheckbox',
        key: 'Avkryssingsboks',
        input: true,
        hideLabel: false,
        clearOnHide: true,
        dataGridLabel: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
      },
    },
    selectboxes: {
      title: 'Flervalg',
      key: 'selectboxes',
      icon: 'plus-square',
      schema: {
        label: 'Flervalg',
        type: 'selectboxes',
        key: 'selectboxes',
        fieldSize: 'input--xxl',
        input: true,
        isNavCheckboxPanel: true,
        clearOnHide: true,
        dataGridLabel: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
      },
    },
    navSelect: {
      title: 'Nedtrekksmeny',
      key: 'navSelect',
      icon: 'th-list',
      schema: {
        label: 'Nedtrekksmeny',
        type: 'navSelect',
        key: 'navSelect',
        fieldSize: 'input--xxl',
        input: true,
        clearOnHide: true,
        dataGridLabel: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
      },
    },
    radiopanel: {
      title: 'Radiopanel',
      key: 'radiopanel',
      icon: 'dot-circle-o',
      documentation: '',
      weight: 0,
      schema: {
        label: 'Radiopanel',
        type: 'radiopanel',
        key: 'radiopanel',
        input: true,
        hideLabel: false,
        clearOnHide: true,
        dataGridLabel: true,
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
      },
    },
    vedlegg: {
      title: 'Vedlegg',
      key: 'vedleggNr',
      icon: 'file',
      schema: {
        label: '< Navn på vedlegg > + husk å legge inn Gosys vedleggstittel og vedleggskode under API-fanen',
        type: 'radiopanel',
        key: 'vedleggNr',
        input: true,
        clearOnHide: true,
        validateOn: 'blur',
        validate: {
          required: true,
        },
        properties: {
          vedleggstittel: '',
          vedleggskode: '',
        },
        values: [
          {
            value: 'leggerVedNaa',
            label: 'Jeg legger det ved denne søknaden (anbefalt)',
          },
          {
            value: 'ettersender',
            label:
              'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
          },
          {
            value: 'levertTidligere',
            label: 'Jeg har levert denne dokumentasjonen tidligere',
          },
        ],
      },
    },
    survey: {
      title: 'Spørreskjema',
      key: 'survey',
      icon: 'clipboard',
      schema: {
        label: 'Spørreskjema',
        type: 'survey',
        key: 'survey',
        input: true,
        clearOnHide: true,
        validateOn: 'blur',
      },
      ignore: true,
    },
    image: {
      title: 'Bilde',
      key: 'image',
      icon: 'clipboard',
      schema: {
        label: 'Bilde',
        type: 'image',
        key: 'image',
        input: false,
      },
    },
    password: {
      ignore: true,
    },
    button: {
      title: 'Knapp',
      key: 'knapp',
      icon: 'button',
      schema: {
        label: 'Knapp',
        type: 'button',
        key: 'knapp',
      },
    },
  },
};

export default basicPalett;
