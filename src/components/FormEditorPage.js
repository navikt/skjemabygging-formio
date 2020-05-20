import React, { Component } from "react";
import PropTypes from "prop-types";
import Formiojs from "formiojs/Formio";
import FormBuilder from "../react-formio/FormBuilder";

class FormEditorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLoaded: false
    };
    this.formio = new Formiojs(this.props.src);
  }

  componentDidMount() {
    this.formio.loadForm().then(form => {
      this.setState({ form, hasLoaded: true });
    });
  }

  formChanged(form) {
    this.setState({ form });
  }

  saveForm() {
    this.formio.saveForm(this.state.form).then(savedForm => this.setState({ form: savedForm }));
  }

  render() {
    if (!this.state.hasLoaded) {
      return "Laster inn...";
    }
    return (
      <div>
        <div className="row">
          <div className="col-lg-2 col-md-4 col-sm-4">
            <div id="form-group-title" className="form-group">
              <label htmlFor="title" className="control-label field-required">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                placeholder="Enter the form title"
                value={this.state.form.title || ""}
                onChange={event => this.handleChange("title", event)}
              />
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-4">
            <div id="form-group-name" className="form-group">
              <label htmlFor="name" className="control-label field-required">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter the form machine name"
                value={this.state.form.name || ""}
                onChange={event => this.handleChange("name", event)}
              />
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-3">
            <div id="form-group-display" className="form-group">
              <label htmlFor="name" className="control-label">
                Display as
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  name="form-display"
                  id="form-display"
                  value={this.state.form.display || ""}
                  onChange={event => this.handleChange("display", event)}
                >
                  <option label="Form" value="form">
                    Form
                  </option>
                  <option label="Wizard" value="wizard">
                    Wizard
                  </option>
                  <option label="PDF" value="pdf">
                    PDF
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-3">
            <div id="form-group-type" className="form-group">
              <label htmlFor="form-type" className="control-label">
                Type
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  name="form-type"
                  id="form-type"
                  value={this.state.form.type}
                  onChange={event => this.handleChange("type", event)}
                >
                  <option label="Form" value="form">
                    Form
                  </option>
                  <option label="Resource" value="resource">
                    Resource
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-4">
            <div id="form-group-path" className="form-group">
              <label htmlFor="path" className="control-label field-required">
                Path
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="path"
                  placeholder="example"
                  style={{ textTransform: "lowercase", width: "120px" }}
                  value={this.state.form.path || ""}
                  onChange={event => this.handleChange("path", event)}
                />
              </div>
            </div>
          </div>
          <div id="save-buttons" className="col-lg-2 col-md-5 col-sm-5 save-buttons pull-right">
            <div className="form-group pull-right">
              <span className="btn btn-primary" onClick={() => this.saveForm()}>
                Lagre
              </span>
            </div>
          </div>
        </div>
        <FormBuilder
          key={this.state.form._id}
          form={this.state.form}
          // options={this.props.options}
          // builder={this.props.builder}
          onChange={form => this.formChanged(form)}
        />
      </div>
    );
  }
}

FormEditorPage.propTypes = {
  src: PropTypes.string.isRequired
};

export default FormEditorPage;
