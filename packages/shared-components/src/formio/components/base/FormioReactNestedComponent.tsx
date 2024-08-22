import { Components, Utils } from 'formiojs';
import { MutableRefObject } from 'react';
import { NavFormioJs } from '../../../index';
import BaseComponent from './BaseComponent';
import { ReactComponentType } from './index';
import _ = Utils._;

class FormioReactNestedComponent extends BaseComponent {
  components;
  nestedRef: MutableRefObject<any> | undefined;

  constructor(component, options, data) {
    super(component, options, data);
  }

  get componentComponents() {
    return this.component?.components || [];
  }

  init() {
    this.components = this.components || [];
    this.addComponents();
    return super.init();
  }

  /**
   *
   * @param element
   * @param data
   */
  addComponents(data?, options?) {
    data = data || this.data;
    options = options || this.options;
    if (options.components) {
      this.components = options.components;
    } else {
      const components = this.hook('addComponents', this.componentComponents, this) || [];
      components.forEach((component) => this.addComponent(component, data));
    }
  }

  /**
   * Add a new component to the components array.
   *
   * @param {Object} component - The component JSON schema to add.
   * @param {Object} data - The submission data object to house the data for this component.
   * @param {HTMLElement} before - A DOM element to insert this element before.
   * @param noAdd
   * @return {Component} - The created component instance.
   */
  addComponent(component, data, before?: HTMLElement, noAdd?: boolean) {
    data = data || this.data;
    if (this.options.parentPath) {
      component.shouldIncludeSubFormPath = true;
    }
    component = this.hook('addComponent', component, data, before, noAdd);
    const comp = this.createComponent(component, this.options, data, before ? before : null);
    if (noAdd) {
      return comp;
    }
    return comp;
  }

  /**
   * Return a path of component's value.
   *
   * @param {Object} component - The component instance.
   * @return {string} - The component's value path.
   */
  calculateComponentPath(component) {
    let path = '';
    if (component.component.key) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let thisPath: ReactComponentType = this;
      while (thisPath && !thisPath.allowData && thisPath.parent) {
        thisPath = thisPath.parent;
      }
      const rowIndex = component.row ? `[${Number.parseInt(component.row)}]` : '';
      path = thisPath.path ? `${thisPath.path}${rowIndex}.` : '';
      path += component._parentPath && component.component.shouldIncludeSubFormPath ? component._parentPath : '';
      path += component.component.key;
      return path;
    }
  }

  /**
   * Create a new component and add it to the components array.
   *
   * @param component
   * @param data
   */
  createComponent(component, options, data, before, replacedComp?) {
    if (!component) {
      return;
    }
    options = options || this.options;
    data = data || this.data;
    options.parent = this;
    options.parentVisible = this.visible;
    options.root = options?.root || this.root || this;
    options.localRoot = this.localRoot;
    options.skipInit = true;
    if (!(options.display === 'pdf' && this.builderMode)) {
      component.id = NavFormioJs.Utils.getRandomComponentId();
    }
    if (!this.isInputComponent && this.component?.shouldIncludeSubFormPath) {
      component.shouldIncludeSubFormPath = true;
    }
    const comp: ReactComponentType = Components.create(component, options, data, true) as ReactComponentType;

    const path = this.calculateComponentPath(comp);
    if (path) {
      comp.path = path;
    }
    comp.init();
    if (component.internal) {
      return comp;
    }

    if (before) {
      const index = _.findIndex(this.components, { id: before.id });
      if (index !== -1) {
        this.components.splice(index, 0, comp);
      } else {
        this.components.push(comp);
      }
    } else if (replacedComp) {
      const index = _.findIndex(this.components, { id: replacedComp.id });
      if (index !== -1) {
        this.components[index] = comp;
      } else {
        this.components.push(comp);
      }
    } else {
      this.components.push(comp);
    }
    return comp;
  }

  getComponents() {
    return this.components || [];
  }

  renderComponents(components) {
    components = components || this.getComponents();
    const children = components.map((component) => component.render());
    return this.renderTemplate('components', {
      children,
      components,
    });
  }

  build(element: any) {
    return this.attach(element);
  }

  attachComponents(element, components?, container?) {
    components = components || this.components;
    container = container || this.component?.components;

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

  setNestedRef(ref) {
    this.nestedRef = ref;
    this.attachComponents(this.nestedRef?.current);
  }
}

export default FormioReactNestedComponent;
