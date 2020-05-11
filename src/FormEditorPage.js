import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Formiojs from "formiojs/Formio";


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
      console.log('flesk flesk');
      this.setState({form, hasLoaded: true});
    });
  }

  render() {
    return (
      <div>


      </div>
    );
  }
}

FormEditorPage.propTypes = {
  src: PropTypes.string.isRequired
};

export default FormEditorPage;
