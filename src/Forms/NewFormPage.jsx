import React, { Component } from "react";
import PropTypes from "prop-types";
import { Hovedknapp } from "nav-frontend-knapper";
import { CreationFormMetadataEditor } from "../components/FormMetadataEditor";
import cloneDeep from "lodash.clonedeep";
import camelCase from "lodash/camelCase";
import { AppLayoutWithContext } from "../components/AppLayout";

class NewFormPage extends Component {
  state = {
    form: {
      tags: ["nav-skjema", ""],
      type: "form",
      display: "wizard",
      name: "",
      title: "",
      path: "",
      properties: {skjemaNummer: 'flesk'}
    },
  };

  setForm = (form) => {
    const newForm = cloneDeep(form);
    this.setState((oldState) => {
      if (oldState.form.title !== newForm.title) {
        newForm.name = camelCase(newForm.title);
        newForm.path = camelCase(newForm.title).toLowerCase();
      }
      return { form: newForm };
    });
  };

  render() {
    return (
      <AppLayoutWithContext navBarProps={{ title: "Opprett nytt skjema", visSkjemaliste: true }}>
        <CreationFormMetadataEditor form={this.state.form} onChange={this.setForm} />
        <Hovedknapp onClick={() => this.props.onCreate(this.state.form)}>Opprett</Hovedknapp>
      </AppLayoutWithContext>
    );
  }
}

NewFormPage.propTypes = {
  onCreate: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

export default NewFormPage;
