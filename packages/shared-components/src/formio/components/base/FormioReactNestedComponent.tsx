import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import NestedComponent from 'formiojs/components/_classes/nested/NestedComponent';
import { TFunction, TOptions } from 'i18next';
import { createRoot } from 'react-dom/client';
import FormioReactComponent from './FormioReactComponent';
import { IBaseComponent, INestedComponent } from './index';

class FormioReactNestedComponent extends (NestedComponent as INestedComponent) implements IBaseComponent {
  rootElement;
  editFields;
  nestedRef;
  reactInstance;

  constructor(component, options, data) {
    super(component, options, data);
    this.reactInstance = null;
  }

  /**
   * Required and used by Form.io
   */
  get defaultSchema() {
    return (this.constructor as typeof FormioReactNestedComponent).schema();
  }

  render() {
    // For react components, we simply render as a div which will become the react instance.
    // By calling super.render(string) it will wrap the component with the needed wrappers to make it a full component.
    return super.render(`<div ref="react-${this.id}"></div>`);
  }

  setNestedRef(ref) {
    this.nestedRef = ref;
    console.log('setNestedref', this.nestedRef, ref);
    this.attachComponents(this.nestedRef.current);
  }

  /**
   * Private function
   *
   * Get the key from all components that is configured in editForm() in the custom component.
   */
  getEditFields() {
    if (!this.editFields) {
      const editForm: Component = (this.constructor as typeof FormioReactComponent).editForm();
      this.editFields = navFormUtils
        .flattenComponents(editForm.components?.[0].components as Component[])
        .map((component) => component.key);
    }

    return this.editFields;
  }

  /**
   * @deprecated Use `translate` instead of `t` in React components
   */
  t = (...params) => {
    return super.t(...params);
  };

  translate(key?: string, options: TOptions = {}): ReturnType<TFunction> {
    if (Object.keys(options).length === 0) {
      return super.t(key);
    }
    return super.t(key, { ...options, interpolation: { escapeValue: false } });
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
    }

    if (this.nestedRef?.current) {
      this.attachComponents(this.nestedRef.current);
    }

    return Promise.resolve();
  }

  detach() {
    if (this.refs[`react-${this.id}`]) {
      this.detachReact(this.refs[`react-${this.id}`]);
    }
    super.detach();
  }

  attachReact(element: any, _ref) {
    this.rootElement = createRoot(element);
    this.renderReact(this.rootElement);
  }

  detachReact(element) {
    // For now we prefer memory leak in development and test over spamming the console log...
    // Wrapping in setTimeout causes problems when we do a redraw, so need to find a different solution.
    // https://github.com/facebook/react/issues/25675#issuecomment-1518272581
    if (element && this.rootElement && process.env.NODE_ENV === 'production') {
      this.rootElement.unmount();
      this.rootElement = undefined;
    }
  }

  setReactInstance(element) {
    this.reactInstance = element;
  }

  /**
   * To render a react component, override this function
   * and pass the jsx element as a param to element's render function
   */
  renderReact(_element) {}
}

export default FormioReactNestedComponent;
