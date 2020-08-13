import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as formiojs from 'formiojs';
import isEqual from 'lodash.isequal';
import cloneDeep from "lodash.clonedeep";
import {styled} from "@material-ui/styles";

const BuilderMountElement = styled("div")({
  '& .builder-sidebar_scroll': {
    top: 190
  },
  '& .formarea': {
  paddingBottom: 800
},
});

export default class NavFormBuilder extends Component {
  builderState = 'preparing';
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    formBuilderOptions: PropTypes.object,
  };

  componentDidMount = () => {
    this.builder = new formiojs.FormBuilder(this.element, {}, this.props.formBuilderOptions);
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.builderState = 'ready';
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
      return;
    }
    this.updateFormBuilder();
  }

  updateFormBuilder() {
    this.builder.setForm(cloneDeep(this.props.form)).then(() => this.handleChange());
  }

  componentWillUnmount = () => {
    this.builder.instance.destroy(true);
    this.builderState = 'destroyed';
    console.log('destroyed builder');
  };

  render = () => {
    return <BuilderMountElement data-testid="builderMountElement" ref={element => this.element = element}></BuilderMountElement>;
  };

  handleChange = () => {
    this.props.onChange(this.builder.instance.form);
  };
}
