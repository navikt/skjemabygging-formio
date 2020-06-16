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
  "inputMask": "99999999999",
  "validateOn": "change",
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
  basic: {
    title: 'Basisk',
    components: {
      fnr: {
        title: 'Fødselsnummer',
        key: 'fnr',
        icon: 'terminal',
        schema: fnrSchema,
      }
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
    console.log('componentDidMount');
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
    console.log('external form state is being set', cloneDeep(this.props.form));
    this.builder.setForm(cloneDeep(this.props.form));
  }

  componentWillUnmount = () => {
    this.builder.instance.destroy(true);
    this.builderState = 'destroyed';
  };

  render = () => {
    console.log('render called element is', this.element);
    return <div data-testid="builderMountElement" ref={element => this.element = element}></div>;
  };

  handleChange = () => {
    console.log('internal form state', cloneDeep(this.builder.instance.form));
    this.props.onChange(this.builder.instance.form);
  };
}
