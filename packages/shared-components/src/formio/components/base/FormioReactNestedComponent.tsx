import NestedComponent from 'formiojs/components/_classes/nested/NestedComponent';
import { createRoot } from 'react-dom/client';
import Ready from '../../../util/form/ready';

class FormioReactNestedComponent extends NestedComponent {
  rootElement: any;
  nestedRef;
  reactInstance;
  _reactRendered = Ready();

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
    return super.render(`<div ref="react-${this.id}"><div ref="${this.nestedKey}"></div></div>`);
  }

  renderComponents(components) {
    components = components || this.getComponents();
    const children = components.map((component) => component.render());
    // console.log('RenderComponents', children, components);
    return this.renderTemplate('components', {
      children,
      components,
    });
  }

  build(element: any) {
    return this.attach(element);
  }

  attachComponents(element, components, container) {
    components = components || this.components;
    container = container || this.component.components;

    element = this.hook('attachComponents', element, components, container, this);
    if (!element) {
      // Return a non-resolving promise.
      return new Promise(() => {});
    }

    let index = 0;
    const promises = [];
    Array.prototype.slice.call(element.children).forEach((child) => {
      if (!child.getAttribute('data-noattach') && components[index]) {
        // @ts-ignore
        promises.push(components[index].attach(child));
        // console.log('components[index]', components[index], child);
        // @ts-ignore
        // promises.push(components[index].attachReact(child));
        index++;
      }
    });
    return Promise.all(promises);
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
    console.log('REFS', this.refs);
    this.loadRefs(element, {
      [`react-${this.id}`]: 'single',
      [this.nestedKey]: 'single',
    });

    if (this.refs[`react-${this.id}`]) {
      this.attachReact(this.refs[`react-${this.id}`], this.setReactInstance.bind(this));
      // if (this.shouldSetValue) {
      //   this.setValue(this.dataForSetting);
      //   this.updateValue(this.dataForSetting);
      // }
    }

    console.log('attach nestedRef', this.nestedRef);
    if (this.nestedRef?.current) {
      const children = this.attachComponents(this.nestedRef.current);
      console.log('children', children);
    }
    // console.log('nestedKey', this.nestedKey);
    // if (this.refs[this.nestedKey]) {
    //   this.attachComponents(this.refs[this.nestedKey]);
    // }

    return Promise.resolve();
  }

  detach() {
    console.log('Detach', this.refs);
    if (this.refs[`react-${this.id}`]) {
      this.detachReact(this.refs[`react-${this.id}`]);
    }
    super.detach();
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

  attachReact(element: any, _ref) {
    this.rootElement = createRoot(element);
    this.renderReact(this.rootElement);
  }

  setReactInstance(element) {
    this.reactInstance = element;
    // this.addFocusBlurEvents(element);
    this._reactRendered.resolve();
  }

  setNestedRef(ref) {
    // console.log('NestedRef', ref);
    if (!this.nestedRef?.current) {
      this.nestedRef = ref;
      console.log('after if', this.nestedRef, ref);
      this.attachComponents(this.nestedRef.current);
      // this.attach(this.element);
    }
  }

  /**
   * To render a react component, override this function
   * and pass the jsx element as a param to element's render function
   */
  renderReact(_element) {}
}

export default FormioReactNestedComponent;
