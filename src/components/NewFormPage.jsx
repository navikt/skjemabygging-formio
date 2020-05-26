import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormMetadataEditor} from "./FormMetadataEditor";
import {Hovedknapp} from "nav-frontend-knapper";

class NewFormPage extends Component {
  state = {
    form: {}
  }
  render() {
    return (
      <div>
        <FormMetadataEditor form={this.state.form} onChange={(form) => this.setState({form: form}) }/>
        <Hovedknapp>
          Opprett
        </Hovedknapp>
      </div>
    );
  }
}

NewFormPage.propTypes = {};

export default NewFormPage;