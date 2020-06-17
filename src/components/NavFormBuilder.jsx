import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AllComponents from 'formiojs/components';
import Components from 'formiojs/components/Components';
import FormioFormBuilder from 'formiojs/FormBuilder';
import isEqual from 'lodash.isequal';
import cloneDeep from "lodash.clonedeep";

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

const fnrSchema = {
  "label": "Fødselsnummer",
  "labelPosition": "top",
  "placeholder": "Fødselsnummer",
  "inputMask": "999999 99999",
  "validateOn": "blur",
  "validate": {
    "required": true,
    "pattern": "",
    "customMessage": "11 siffer",
  },
  "key": "fnr",
  "tags": [],
  "type": "textfield",
  "input": true
};

const builderPalett = {
  advanced: {
    title: 'Tilpassede felter',
    components: {
      fnr: {
        title: 'Fødselsnummer',
        key: 'fnr',
        icon: 'terminal',
        schema: fnrSchema,
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
        title: "Telefonnummer",
        key: 'phoneNumber',
        icon: 'phone-square',
        schema: {
          label: 'Telefonnummer',
          type: 'phoneNumber',
          key: 'phoneNumber',
          input: true,
          inputMask: "999 999 99",
          validateOn: "blur",
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
        title: "Lang tekst",
        key: 'textarea',
        icon: 'font',
        schema: {
          label: 'Lang tekst',
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


Components.setComponents(AllComponents);

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
