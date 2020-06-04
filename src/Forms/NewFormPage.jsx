import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Hovedknapp} from "nav-frontend-knapper";
import {CopyOfFormMetadataEditor} from "../components/FormMetadataEditor";
import cloneDeep from "lodash.clonedeep";
import camelCase from 'lodash/camelCase';

class NewFormPage extends Component {
  state = {
    form: {
      tags: ['nav-skjema'],
      type: 'form',
      display: 'form',
      name: '',
      title: '',
      path: '',
    },
  }

  setForm = (form) => {
    const newForm = cloneDeep(form);
    this.setState((oldState) => {
      if (oldState.form.title !== newForm.title) {
        newForm.name = camelCase(newForm.title);
        newForm.path = camelCase(newForm.title).toLowerCase();
      }
      return {form: newForm};
    });
  };

  render() {
    return (
      <div>
        <CopyOfFormMetadataEditor form={this.state.form} onChange={this.setForm}/>
        <Hovedknapp onClick={() => this.props.onCreate(this.state.form)}>
          Opprett
        </Hovedknapp>
      </div>
    );
  }
}

NewFormPage.propTypes = {
  onCreate: PropTypes.func.isRequired
};

export default NewFormPage;