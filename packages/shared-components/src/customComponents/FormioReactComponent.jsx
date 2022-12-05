/*
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
 * */

import Field from "formiojs/components/_classes/field/Field";

export default class FormioReactComponent extends Field {
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

  redraw() {
    return super.redraw();
  }

  get dataReady() {
    return super.dataReady();
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
      [`react-${this.id}`]: "single",
    });

    if (this.refs[`react-${this.id}`]) {
      this.reactInstance = this.attachReact(this.refs[`react-${this.id}`]);
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
   */
  attachReact(element) {
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
   */
  setValue(value, flags = {}) {
    return this.updateValue(value, flags);
  }

  /**
   * The user has changed the value in the component and the value needs to be updated on the main submission object and other components notified of a change event.
   *
   * @param value
   */
  updateValue = (value, flags) => {
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
   * Component should be cleared when hidden if clearOnHide is set to true. Copied function from formio.js/component.js.
   */
  clearOnHide() {
    // clearOnHide defaults to true for old forms (without the value set) so only trigger if the value is false.
    if (this.component.clearOnHide !== false && !this.options.readOnly && !this.options.showHiddenFields) {
      if (!this.visible) {
        this.deleteValue();
      } else if (!this.hasValue() && this.shouldAddDefaultValue) {
        // If shown, ensure the default is set.
        this.setValue(this.defaultValue, {
          noUpdateEvent: true,
        });
      }
    }
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
}
