import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as formiojs from 'formiojs';
import isEqual from 'lodash.isequal';
import cloneDeep from "lodash.clonedeep";
import {styled} from "@material-ui/styles";

const BuilderMountElement = styled("div")({
  '& .builder-sidebar_scroll': {
    top: 230
  },
  '& .formarea': {
  paddingBottom: "50vh"
},
});

export default class NavFormBuilder extends Component {
  builderState = 'preparing';
  element = React.createRef();
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    formBuilderOptions: PropTypes.object,
  };

  handleChange = () => {
    if (this.builder) {
      this.props.onChange(cloneDeep(this.builder.instance.form));
    }
  };

  createBuilder = () => {
    this.builder = new formiojs.FormBuilder(this.element.current, cloneDeep(this.props.form), this.props.formBuilderOptions);
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.builderState = 'ready';
      //this.builder.setForm(cloneDeep(this.props.form)).then(() => this.handleChange());
      this.handleChange();
      this.builder.instance.on('addComponent', this.handleChange);
      this.builder.instance.on('saveComponent', this.handleChange);
      this.builder.instance.on('updateComponent', this.handleChange);
      this.builder.instance.on('removeComponent', this.handleChange);
      this.builder.instance.on('deleteComponent', this.handleChange);
      this.builder.instance.on('pdfUploaded', this.handleChange);
    });
  };

  destroyBuilder = () => {
    this.builder.destroy();
    this.builder.instance.destroy(true);
    this.builder = null;
    this.builderState = 'destroyed';
    console.log('destroyed builder');
  };

  updateFormBuilder() {
    this.destroyBuilder();
    this.createBuilder();
  }

  componentDidMount = () => {
    this.createBuilder();
  };

  componentDidUpdate = () => {
    if (isEqual(this.builder.instance.form, this.props.form)) {
      return;
    }
    this.updateFormBuilder();
  };

  componentWillUnmount = () => {
    this.destroyBuilder();
  };

  render = () => {
    return <BuilderMountElement data-testid="builderMountElement" ref={this.element}></BuilderMountElement>;
  };
}
