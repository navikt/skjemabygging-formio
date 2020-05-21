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
    const form = {...{flesk: true}, ...props.form};
    console.log('flesk', form.flesk);
    if (this.builder !== undefined) {
      this.builder.instance.destroy(true);
    }

    this.builder = new FormioFormBuilder(this.element, form, {});
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      console.log('got there');
      this.handleChange();
      this.builder.instance.on('addComponent', this.handleChange);
      this.builder.instance.on('saveComponent', this.handleChange);
      this.builder.instance.on('updateComponent', this.handleChange);
      this.builder.instance.on('removeComponent', this.handleChange);
      this.builder.instance.on('deleteComponent', this.handleChange);
      this.builder.instance.on('pdfUploaded', this.handleChange);
    });
  };

  render = () => {
    return <div data-testid="builderMountParent">
      <div data-testid="builderMountElement" ref={element => this.element = element}></div>
    </div>;
  };

  handleChange = () => {
    console.log('got handleChange flesk', this.builder.instance.form.flesk);
    this.props.onChange(this.builder.instance.form);
  };
}
