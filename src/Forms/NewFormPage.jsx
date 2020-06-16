import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Hovedknapp} from "nav-frontend-knapper";
import {CreationFormMetadataEditor} from "../components/FormMetadataEditor";
import cloneDeep from "lodash.clonedeep";
import camelCase from 'lodash/camelCase';
import {Pagewrapper} from "./components";
import {MenuLink, NavBar} from "../components/NavBar";

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
    const title = "Lag nytt skjema";
    return (
      <>
        <NavBar title={title}>
          <MenuLink to="/forms">Skjemaer</MenuLink>
          <MenuLink to="/" onClick={this.props.logout}>
            Logg ut
          </MenuLink>
        </NavBar>
      <Pagewrapper>
        <CreationFormMetadataEditor form={this.state.form} onChange={this.setForm}/>
        <Hovedknapp onClick={() => this.props.onCreate(this.state.form)}>
          Opprett
        </Hovedknapp>
      </Pagewrapper>
        </>
    );
  }
}

NewFormPage.propTypes = {
  onCreate: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
};

export default NewFormPage;
