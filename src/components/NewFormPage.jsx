import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Hovedknapp} from "nav-frontend-knapper";
import {CopyOfFormMetadataEditor} from "./CopyOfFormMetadataEditor";

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
  render() {
    return (
      <div>
        <CopyOfFormMetadataEditor form={this.state.form} onChange={(form) => this.setState({form: form}) }/>
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