/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Form.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This file is a copy of https://github.com/formio/react/blob/master/src/components/ReactComponent.jsx
 * Consider using this directly from @formio/react instead
 */

import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';

interface IField {
  new (component, options, data): FieldType;
  prototype: FieldType;
  schema(sources: any): any;
}

interface FieldType {
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: any;
  attachReact(element, ref): any;
  detachReact(element): any;
  validate(data, dirty, rowData): boolean;
  updateValue: (value, flags?: {}) => any;
  setReactInstance(element): void;

  // Field
  render(element: any): any;

  // Component
  component?: Component;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  errors: any[];
  root: any;
  options: any;
  visible: any | boolean;
  init(): any;
  redraw(): any;
  attach(element: any): any;
  detach(): void;
  destroy(): void;
  beforeSubmit(): any;
  updateOnChange(flags: any, changed: boolean | any): boolean;
  t(text: string, params?: any): any;
  loadRefs(element: any, refs: any): any;
  checkValidity(data: any, dirty: any | boolean, rowData: any): boolean;
  getValue(): any;
  setValue(value: any, flags: any): void;
  hasChanged(before: any, after: any): boolean;
  clearOnHide(): void;
  deleteValue(): void;
  hasValue(): boolean;

  // Element
  id?: any;
  emit(event: string, data: Object): void;
}

const ReactComponent = class extends (Field as IField) {
  reactInstance;
  shouldSetValue;
  dataForSetting;

  /**
   * This is the first phase of component building where the component is instantiated.
   *
   * @param component - The component definition created from the settings form.
   * @param options - Any options passed into the renderer.
   * @param data - The submission data where this component's data exists.
   */
  constructor(component, options, data) {
    super(component, options, data);
    this.reactInstance = null;
  }

  /**
   * This method is called any time the component needs to be rebuilt. It is most frequently used to listen to other
   * components using the this.on() function.
   */
  init() {
    return super.init();
  }

  /**
   * This method is called before the component is going to be destroyed, which is when the component instance is
   * destroyed. This is different from detach which is when the component instance still exists but the dom instance is
   * removed.
   */
  destroy() {
    return super.destroy();
  }

  /**
   * This method is called before a form is submitted.
   * It is used to perform any necessary actions or checks before the form data is sent.
   *
   */

  beforeSubmit() {
    return super.beforeSubmit();
  }

  /**
   * The second phase of component building where the component is rendered as an HTML string.
   *
   * @returns {string} - The return is the full string of the component
   */
  render() {
    // For react components, we simply render as a div which will become the react instance.
    // By calling super.render(string) it will wrap the component with the needed wrappers to make it a full component.
    return super.render(`<div ref="react-${this.id}"></div>`);
  }

  /**
   * Callback ref to store a reference to the node.
   *
   * @param element - the node
   */
  setReactInstance(element) {
    this.reactInstance = element;
  }

  /**
   * The third phase of component building where the component has been attached to the DOM as 'element' and is ready
   * to have its javascript events attached.
   *
   * @param element
   * @returns {Promise<void>} - Return a promise that resolves when the attach is complete.
   */
  attach(element) {
    super.attach(element);

    // The loadRefs function will find all dom elements that have the "ref" setting that match the object property.
    // It can load a single element or multiple elements with the same ref.
    this.loadRefs(element, {
      [`react-${this.id}`]: 'single',
    });

    if (this.refs[`react-${this.id}`]) {
      this.attachReact(this.refs[`react-${this.id}`], this.setReactInstance.bind(this));
      if (this.shouldSetValue) {
        this.setValue(this.dataForSetting);
        this.updateValue(this.dataForSetting);
      }
    }
    return Promise.resolve();
  }

  /**
   * The fourth phase of component building where the component is being removed from the page. This could be a redraw
   * or it is being removed from the form.
   */
  detach() {
    if (this.refs[`react-${this.id}`]) {
      this.detachReact(this.refs[`react-${this.id}`]);
    }
    super.detach();
  }

  /**
   * Override this function to insert your custom component.
   *
   * @param element
   * @param ref - callback ref
   */
  attachReact(element, ref) {
    return;
  }

  /**
   * Override this function.
   */
  detachReact(element) {
    return;
  }

  /**
   * Something external has set a value and our component needs to be updated to reflect that. For example, loading a submission.
   *
   * @param value
   * @param flags
   */
  setValue(value, flags = {}) {
    if (this.reactInstance) {
      this.reactInstance.setState({
        value: value,
      });
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
      this.dataForSetting = value;
    }
  }

  /**
   * The user has changed the value in the component and the value needs to be updated on the main submission object and other components notified of a change event.
   *
   * @param value
   * @param flags
   */
  updateValue = (value, flags = {}) => {
    flags = flags || {};
    const newValue = value === undefined || value === null ? this.getValue() : value;
    const changed = newValue !== undefined ? this.hasChanged(newValue, this.dataValue) : false;
    this.dataValue = Array.isArray(newValue) ? [...newValue] : newValue;

    this.updateOnChange(flags, changed);
    return changed;
  };

  /**
   * Get the current value of the component. Should return the value set in the react component.
   *
   * @returns {*}
   */
  getValue() {
    if (this.reactInstance) {
      return this.reactInstance.state.value;
    }
    return this.defaultValue;
  }

  /**
   * Override normal validation check to insert custom validation in react component.
   *
   * @param data
   * @param dirty
   * @param rowData
   * @returns {boolean}
   */
  checkValidity(data, dirty, rowData) {
    const valid = super.checkValidity(data, dirty, rowData);
    if (!valid) {
      return false;
    }
    return this.validate(data, dirty, rowData);
  }

  /**
   * Do custom validation.
   *
   * @param data
   * @param dirty
   * @param rowData
   * @returns {boolean}
   */
  validate(data, dirty, rowData) {
    return true;
  }
};

//export default ReactComponent as unknown as IReactComponent;
export default ReactComponent;