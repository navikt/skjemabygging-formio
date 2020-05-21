import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AllComponents from 'formiojs/components';
import Components from 'formiojs/components/Components';
import FormioFormBuilder from 'formiojs/FormBuilder';

Components.setComponents(AllComponents);

export default class NavFormBuilder extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.initializeBuilder(this.props);
  };

  componentWillUnmount = () => {
    if (this.builder !== undefined) {
      this.builder.instance.destroy(true);
    }
  };

  initializeBuilder = (props) => {
    const options = Object.assign({}, props.options);
    const form = Object.assign({}, props.form);
    const Builder = props.Builder;

    if (this.builder !== undefined) {
      this.builder.instance.destroy(true);
    }

    this.builder = new Builder(this.element.firstChild, form, options);
    this.builderReady = this.builder.ready;

    this.builderReady.then(() => {
      this.onChange();
      this.builder.instance.on('addComponent', this.handleChange);
      this.builder.instance.on('saveComponent', this.handleChange);
      this.builder.instance.on('updateComponent', this.handleChange);
      this.builder.instance.on('removeComponent', this.handleChange);
      this.builder.instance.on('deleteComponent', this.handleChange);
      this.builder.instance.on('pdfUploaded', this.onChange);
    });
  };

  render = () => {
    return <div data-testid="builderMountParent" ref={element => this.element = element}>
      <div></div>
    </div>;
  };

  handleChange = () => {
      this.props.onChange(this.builder.instance.form);
  };
}
