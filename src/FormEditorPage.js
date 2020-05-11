import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Formiojs from "formiojs/Formio";
import FormBuilder from "./react-formio/FormBuilder";


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
      this.setState({form, hasLoaded: true});
    });
  }

  formChanged(form) {
    this.setState({form});
  }

  render() {
    if (!this.state.hasLoaded) {
      return 'Laster inn...';
    }
    return (<FormBuilder
        key={this.state.form._id}
        form={this.state.form}
        options={this.props.options}
        builder={this.props.builder}
        onChange={(form) => this.formChanged(form)}
      />
    );
  }
}

FormEditorPage.propTypes = {
  src: PropTypes.string.isRequired
};

export default FormEditorPage;
