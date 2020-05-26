import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AllComponents from 'formiojs/components';
import Components from 'formiojs/components/Components';
import FormioFormBuilder from 'formiojs/FormBuilder';
import isEqual from 'lodash.isequal';
import cloneDeep from "lodash.clonedeep";

Components.setComponents(AllComponents);

export default class NavFormBuilder extends Component {
  hasLoaded = false;
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    console.log('mounting');
    this.builder = new FormioFormBuilder(this.element, {}, {});
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.hasLoaded = true;
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
      console.log('componentDidUpdate called in vain');
      return;
    }
    console.log('componentDidUpdate updated form', this.props.form);
    this.updateFormBuilder();
  }

  updateFormBuilder() {
    this.builder.setForm(cloneDeep(this.props.form));
  }

  componentWillUnmount = () => {
    console.log('unmounting');
    this.builder.instance.destroy(true);
  };

  render = () => {
    return <div data-testid="builderMountElement" ref={element => this.element = element}></div>;
  };

  handleChange = () => {
    console.log('got handleChange');
    this.props.onChange(this.builder.instance.form);
  };
}
