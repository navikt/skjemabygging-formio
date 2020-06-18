import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Components from 'formiojs/components/Components';
import FormioFormBuilder from 'formiojs/FormBuilder';
import isEqual from 'lodash.isequal';
import cloneDeep from "lodash.clonedeep";
import Custom from '../Custom';

const builderEditForm = {
  // placeholder, just defines defaults. Modifiy this later
      textfield: [{
        key: "display",
        components: []
      },
      {
        key: "data",
        components: []
      },
      {
        key: "validation",
        components: []
      },
      {
        key: "api",
        components: []
      },
      {
        key: "conditional",
        components: []
      },
      {
        key: "logic",
        components: []
      }
    ]
};

const builderPalett = {
  advanced: {
    title: 'Tilpassede felter',
    components: {
      /*
      fnr: {
        title: 'Fødselsnummer',
        key: 'fnr',
        icon: 'terminal',
        schema: fnrSchema,
      },

       */
      firstName: {
        title: "Fornavn",
        key: 'fornavn',
        icon: 'user',
        schema: {
          label: 'Fornavn',
          type: 'textfield',
          key: 'fornavn',
          input: true,
          placeholder: "Fornavn",
          validate: {
            required: true,
          },
        },
      },
      surname: {
        title: "Etternavn",
        key: 'etternavn',
        icon: 'user',
        schema: {
          label: 'Etternavn',
          type: 'textfield',
          key: 'etternavn',
          input: true,
          placeholder: "Etternavn",
          validate: {
            required: true,
          },
        },
      },
      streetAddress: {
        title: "Gatedresse",
        key: 'gateadresse',
        icon: 'home',
        schema: {
          label: 'Gateadresse',
          type: 'textfield',
          key: 'gateadresse',
          input: true,
          placeholder: "Gateveien 1",
          validate: {
            required: true,
          },
        },
      },
      postcode: {
        title: "Postnummer",
        key: 'postnr',
        icon: 'home',
        schema: {
          label: 'Postnummer',
          type: 'textfield',
          key: 'postnr',
          input: true,
          placeholder: "1234",
          inputMask: "9999",
          validateOn: "blur",
          validate: {
            required: true,
            customMessage: "4 siffer"
          },
        },
      },
      city: {
        title: "Poststed",
        key: 'poststed',
        icon: 'home',
        schema: {
          label: 'Poststed',
          type: 'textfield',
          key: 'poststed',
          input: true,
          placeholder: "",
          validate: {
            required: true,
          },
        },
      },
      email: {
        title: "E-post",
        key: 'email',
        icon: 'at',
        schema: {
          label: 'E-post',
          type: 'email',
          key: 'email',
          input: true
        },
      },
      url: {
        title: "Lenke",
        key: 'url',
        icon: 'link',
        schema: {
          label: 'Lenke',
          type: 'url',
          key: 'url',
          input: true
        },
      },
      phoneNumber: {
        title: "Telefon",
        key: 'phoneNumber',
        icon: 'phone-square',
        schema: {
          label: 'Telefonnummer',
          type: 'phoneNumber',
          key: 'phoneNumber',
          input: true,
          inputMask: "999 999 99",
          validateOn: "blur",
          prefix: "+47",
          validate: {
            required: true,
            pattern: "",
            customMessage: "8 siffer",
          },
        },
      },
      tags: {
        title: "Stikkord",
        key: 'tags',
        icon: 'tags',
        schema: {
          label: 'Stikkord',
          type: 'tags',
          key: 'tags',
          input: true
        },
      },
      month: {
        title: "Måned",
        key: 'month',
        icon: 'calendar',
        schema: {
          label: 'Måned',
          type: 'datetime',
          key: 'month',
          input: true,
          datePicker: {
            showWeeks: true,
            startingDay: 0,
            initDate: "",
            minMode: "month",
            maxMode: "year",
            yearRows: 4,
            yearColumns: 5,
            minDate: null,
            maxDate: null,
            datepickerMode: "month"
          },
        },
      },
      currency: {
        title: "Beløp",
        key: 'belop',
        icon: 'dollar',
        schema: {
          label: 'Beløp',
          type: 'currency',
          key: 'belop',
          input: true,
          currency: "nok",
        },
      },
      orgNr: {
        title: "Org.nr.",
        key: 'orgNr',
        icon: 'institution',
        schema: {
          label: 'Organisasjonsnummer',
          type: 'textfield',
          key: 'orgNr',
          input: true,
          inputMask: "999 999 999",
          validateOn: "blur",
          validate: {
            required: true,
            customMessage: "9 siffer",
          },
        },
      },
      address: {
        title: "Adresse",
        key: 'address',
        icon: 'home',
        schema: {
          label: 'Adresse',
          type: 'address',
          key: 'address',
          input: true,
        },
      },
      datetime: {
        title: "Dato / tid",
        key: 'datetime',
        icon: 'calendar',
        schema: {
          label: 'Dato / tid',
          type: 'datetime',
          key: 'datetime',
          input: true,
        },
      },
      day: {
        title: "Dag / mnd / år",
        key: 'day',
        icon: 'calendar',
        schema: {
          label: 'Ukedag',
          type: 'day',
          key: 'day',
          input: true,
          inputMask: "9999",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      time: {
        title: "Tid",
        key: 'time',
        icon: 'clock-o',
        schema: {
          label: 'Tid',
          type: 'time',
          key: 'time',
          input: true,
        },
      },
      signature: {
        title: "Underskrift",
        key: 'signature',
        icon: 'pencil-square-o',
        schema: {
          label: 'Underskrift',
          type: 'signature',
          key: 'signature',
          input: true,
        },
      },
      survey: {
        title: "Spørreskjema",
        key: 'survey',
        icon: 'clipboard',
        schema: {
          label: 'Spørreskjema',
          type: 'survey',
          key: 'survey',
          input: true,
        },
      },
    }
  },
  basic: {
    title: 'Basisk',
    components: {
      textfield: {
        title: "Tekstfelt",
        key: 'textfield',
        icon: 'terminal',
        schema: {
          label: 'Tekstfelt',
          type: 'textfield',
          key: 'textfield',
          input: true
        },
      },
      textarea: {
        title: "Tekstområde",
        key: 'textarea',
        icon: 'font',
        schema: {
          label: 'Tekstområde',
          type: 'textarea',
          key: 'textarea',
          input: true
        },
      },
      number: {
        title: "Tall",
        key: 'number',
        icon: 'hashtag',
        schema: {
          label: 'Tall',
          type: 'number',
          key: 'number',
          input: true
        },
      },
      password: {
        title: "Passord",
        key: 'password',
        icon: 'asterisk',
        schema: {
          label: 'Passord',
          type: 'password',
          key: 'password',
          input: true
        },
      },
      checkbox: {
        title: "Avkryssingsboks",
        key: 'checkbox',
        icon: 'check-square',
        schema: {
          label: 'Avkryssingsboks',
          type: 'checkbox',
          key: 'checkbox',
          input: true
        },
      },
      selectboxes: {
        title: "Flervalg",
        key: 'selectboxes',
        icon: 'plus-square',
        schema: {
          label: 'Flervalg',
          type: 'selectboxes',
          key: 'selectboxes',
          input: true
        },
      },
      select: {
        title: "Nedtrekksmeny",
        key: 'select',
        icon: 'th-list',
        schema: {
          label: 'Nedtrekksmeny',
          type: 'select',
          key: 'select',
          input: true
        },
      },
      radio: {
        title: "Radioknapp",
        key: 'radio',
        icon: 'dot-circle-o',
        schema: {
          label: 'Radioknapp',
          type: 'radio',
          key: 'radio',
          input: true
        },
      },
      button: {
        title: "Knapp",
        key: 'button',
        icon: 'stop',
        schema: {
          label: 'Knapp',
          type: 'button',
          key: 'button',
          input: true
        },
      },
    },
  }
};


Components.setComponents(Custom);

export default class NavFormBuilder extends Component {
  builderState = 'preparing';
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.builder = new FormioFormBuilder(this.element, {}, {
      builder: builderPalett,
      editForm: builderEditForm
    });
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.builderState = 'ready';
      this.updateFormBuilder();
      this.handleChange();
      this.builder.instance.on('addComponent', this.handleChange);
      this.builder.instance.on('saveComponent', this.handleChange);
      this.builder.instance.on('updateComponent', this.handleChange);
      this.builder.instance.on('removeComponent', this.handleChange);
      this.builder.instance.on('deleteComponent', this.handleChange);
      this.builder.instance.on('pdfUploaded', this.handleChange);
    });
  };

  componentDidUpdate = (prevProps) => {
    if (isEqual(prevProps.form, this.props.form)) {
      return;
    }
    this.updateFormBuilder();
  }

  updateFormBuilder() {
    this.builder.setForm(cloneDeep(this.props.form)).then(() => this.handleChange());
  }

  componentWillUnmount = () => {
    this.builder.instance.destroy(true);
    this.builderState = 'destroyed';
  };

  render = () => {
    return <div data-testid="builderMountElement" ref={element => this.element = element}></div>;
  };

  handleChange = () => {
    this.props.onChange(this.builder.instance.form);
  };
}
