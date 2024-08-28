import { Components, Utils } from 'formiojs';
import { MutableRefObject } from 'react';
import { NavFormioJs } from '../../../index';
import BaseComponent from './BaseComponent';
import { ReactComponentType } from './index';
import _ = Utils._;

class FormioReactNestedComponent extends BaseComponent {
  components;
  nestedRef: MutableRefObject<any> | undefined;
  _visible: boolean;

  constructor(component, options, data) {
    super(component, options, data);
    this._visible = true;
  }

  getContainer() {
    return this.element;
  }

  get componentComponents() {
    return this.component?.components || [];
  }

  get nestedKey() {
    return `nested-${this.key}`;
  }

  get templateName() {
    return 'container';
  }

  getComponents() {
    return this.components || [];
  }

  get isDirty() {
    return this.dirty && this.getComponents().every((c) => c.isDirty);
  }

  init() {
    this.components = this.components || [];
    this.addComponents();
    return super.init();
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
    Array.prototype.slice.call(element?.children ?? []).forEach((child) => {
      if (!child.getAttribute('data-noattach') && components[index]) {
        // @ts-ignore
        promises.push(components[index].attach(child));
        // @ts-ignore
        // promises.push(components[index].attachReact(child));
        index++;
      }
    });
    return Promise.all(promises);
  }

  attach(element) {
    const superPromise = super.attach(element);

    // this.loadRefs(element, {
    //   header: 'single',
    //   collapsed: this.collapsed,
    //   [this.nestedKey]: 'single',
    // });

    let childPromise: Promise<unknown> = Promise.resolve();
    if (this.nestedRef || element) {
      childPromise = this.attachComponents(element || this.nestedRef);
    }
    //
    // if (!this.visible) {
    //   this.attachComponentsLogic();
    // }

    // if (this.component.collapsible && this.refs.header) {
    //   this.addEventListener(this.refs.header, 'click', () => {
    //     this.collapsed = !this.collapsed;
    //   });
    //   this.addEventListener(this.refs.header, 'keydown', (e) => {
    //     if (e.keyCode === 13 || e.keyCode === 32) {
    //       e.preventDefault();
    //       this.collapsed = !this.collapsed;
    //     }
    //   });
    // }

    return Promise.all([superPromise, childPromise]);
  }

  setNestedRef(ref) {
    this.nestedRef = ref;
    this.attachComponents(this.nestedRef?.current);
  }

  /*Copy paste*/

  /**
   * Remove a component from the components array.
   *
   * @param {Component} component - The component to remove from the components.
   * @param {Array<Component>} components - An array of components to remove this component from.
   */
  removeComponent(component, components) {
    components = components || this.components;
    component.destroy();
    _.remove(components, { id: component.id });
  }

  detach() {
    this.components.forEach((component) => {
      component.detach();
    });
    super.detach();
  }

  clear() {
    this.components.forEach((component) => {
      component.clear();
    });
    super.clear();
  }

  destroy() {
    this.destroyComponents();
    super.destroy();
  }

  destroyComponents() {
    const components = this.getComponents().slice();
    components.forEach((comp) => this.removeComponent(comp, this.components));
    this.components = [];
  }

  checkData(data, flags, row, components) {
    if (this.builderMode) {
      return true;
    }
    data = data || this.rootValue;
    flags = flags || {};
    row = row || this.data;
    components = components && _.isArray(components) ? components : this.getComponents();
    const isValid = components.reduce(
      (valid, comp) => {
        return comp.checkData(data, { ...flags }, row) && valid;
      },
      super.checkData(data, { ...flags }, row),
    );

    this.checkModal(isValid, this.isDirty);
    return isValid;
  }

  checkConditions(data, flags, row) {
    // check conditions of parent component first, because it may influence on visibility of it's children
    const check = super.checkConditions(data, flags, row);
    //row data of parent component not always corresponds to row of nested components, use comp.data as row data for children instead
    this.getComponents().forEach((comp) => comp.checkConditions(data, flags, comp.data));
    return check;
  }

  clearOnHide(show) {
    super.clearOnHide(show);
    if (this.component?.clearOnHide) {
      if (this.allowData && !this.hasValue() && !(this.options.server && !this.visible)) {
        this.dataValue = this.defaultValue;
      }
      if (this.hasValue()) {
        this.restoreComponentsContext();
      }
    }
    this.getComponents().forEach((component) => component.clearOnHide(show));
  }

  restoreComponentsContext() {
    this.getComponents().forEach((component) => (component.data = this.dataValue));
  }

  set visible(value) {
    // DO NOT CALL super here.  There is an issue where clearOnHide was getting triggered with
    // subcomponents because the "parentVisible" flag was set to false when it should really be
    // set to true.
    const visibilityChanged = this._visible !== value;
    this._visible = value;
    const isVisible = this.visible;
    const forceShow = this.shouldForceShow();
    const forceHide = this.shouldForceHide();
    this.components.forEach((component) => {
      // Set the parent visibility first since we may have nested components within nested components
      // and they need to be able to determine their visibility based on the parent visibility.
      component.parentVisible = isVisible;

      const conditionallyVisible = component.conditionallyVisible();
      if (forceShow || conditionallyVisible) {
        component.visible = true;
      } else if (forceHide || !isVisible || !conditionallyVisible) {
        component.visible = false;
      }
      // If hiding a nested component, clear all errors below.
      if (!component.visible) {
        component.error = '';
      }
    });
    if (visibilityChanged) {
      this.clearOnHide();
      this.redraw();
    }
  }

  get visible() {
    return super.visible;
  }

  set parentVisible(value) {
    super.parentVisible = value;
    this.components.forEach((component) => (component.parentVisible = this.visible));
  }

  get parentVisible() {
    return super.parentVisible;
  }

  get disabled() {
    return super.disabled;
  }

  set disabled(disabled) {
    super.disabled = disabled;
    this.components.forEach((component) => (component.parentDisabled = disabled));
  }

  set parentDisabled(value) {
    super.parentDisabled = value;
    this.components.forEach((component) => {
      component.parentDisabled = this.disabled;
    });
  }

  get parentDisabled() {
    return super.parentDisabled;
  }

  get ready() {
    return Promise.all(this.getComponents().map((component) => component.ready));
  }

  get currentForm() {
    return super.currentForm;
  }

  set currentForm(instance) {
    super.currentForm = instance;
    this.getComponents().forEach((component) => {
      component.currentForm = instance;
    });
  }

  get rowIndex() {
    return this._rowIndex;
  }

  set rowIndex(value) {
    this._rowIndex = value;
    this.eachComponent((component) => {
      component.rowIndex = value;
    });
  }

  componentContext() {
    return this._data;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.eachComponent((component) => {
      component.data = this.componentContext(component);
    });
  }

  // getComponents() {
  //   return this.components || [];
  // }

  /**
   * Perform a deep iteration over every component, including those
   * within other container based components.
   *
   * @param {function} fn - Called for every component.
   */
  everyComponent(fn, options?: any) {
    const components = this.getComponents();
    _.each(components, (component, index) => {
      if (fn(component, components, index) === false) {
        return false;
      }

      if (typeof component.everyComponent === 'function') {
        if (component.everyComponent(fn, options) === false) {
          return false;
        }
      }
    });
  }

  hasComponent(component) {
    let result = false;

    this.everyComponent((comp) => {
      if (comp === component) {
        result = true;
        return false;
      }
    });

    return result;
  }

  flattenComponents() {
    const result = {};

    this.everyComponent((component) => {
      result[component.component.flattenAs || component.key] = component;
    });

    return result;
  }

  attachComponentsLogic(components) {
    components = components || this.components;

    _.each(components, (comp) => {
      comp.attachLogic();

      if (_.isFunction(comp.attachComponentsLogic)) {
        comp.attachComponentsLogic();
      }
    });
  }

  /**
   * Removes a component provided the API key of that component.
   *
   * @param {string} key - The API key of the component to remove.
   * @param {function} fn - Called once the component is removed.
   * @return {null}
   */
  removeComponentByKey(key, fn) {
    const comp = this.getComponent(key, (component, components) => {
      this.removeComponent(component, components);
      if (fn) {
        fn(component, components);
      }
    });
    if (!comp) {
      if (fn) {
        fn(null);
      }
      return null;
    }
  }

  /**
   * Removes a component provided the Id of the component.
   *
   * @param {string} id - The Id of the component to remove.
   * @param {function} fn - Called when the component is removed.
   * @return {null}
   */
  removeComponentById(id, fn) {
    const comp = this.getComponentById(id, (component, components) => {
      this.removeComponent(component, components);
      if (fn) {
        fn(component, components);
      }
    });
    if (!comp) {
      if (fn) {
        fn(null);
      }
      return null;
    }
  }

  updateValue(value, flags = {}) {
    return this.components.reduce(
      (changed, comp) => {
        return comp.updateValue(null, flags) || changed;
      },
      super.updateValue(value, flags),
    );
  }

  shouldSkipValidation(data, dirty, row) {
    // Nested components with no input should not be validated.
    if (!this.component?.input) {
      return true;
    } else {
      return super.shouldSkipValidation(data, dirty, row);
    }
  }

  /**
   * Allow components to hook into the next page trigger to perform their own logic.
   *
   * @return {*}
   */
  beforePage(next) {
    return Promise.all(this.getComponents().map((comp) => comp.beforePage(next)));
  }

  /**
   * Allow components to hook into the submission to provide their own async data.
   *
   * @return {*}
   */
  beforeSubmit() {
    return Promise.all(this.getComponents().map((comp) => comp.beforeSubmit()));
  }

  calculateValue(data, flags, row) {
    // Do not iterate into children and calculateValues if this nested component is conditionally hidden.
    if (!this.conditionallyVisible()) {
      return false;
    }
    return this.getComponents().reduce(
      (changed, comp) => comp.calculateValue(data, flags, row) || changed,
      super.calculateValue(data, flags, row),
    );
  }

  isLastPage() {
    return this.pages.length - 1 === this.page;
  }

  isValid(data, dirty) {
    return this.getComponents().reduce((valid, comp) => comp.isValid(data, dirty) && valid, super.isValid(data, dirty));
  }

  checkChildComponentsValidity(data, dirty, row, silentCheck, isParentValid) {
    return this.getComponents().reduce(
      (check, comp) => comp.checkValidity(data, dirty, row, silentCheck) && check,
      isParentValid,
    );
  }

  checkValidity(data, dirty, row, silentCheck) {
    if (!this.checkCondition(row, data)) {
      this.setCustomValidity('');
      return true;
    }

    const isValid = this.checkChildComponentsValidity(
      data,
      dirty,
      row,
      silentCheck,
      super.checkValidity(data, dirty, row, silentCheck),
    );
    this.checkModal(isValid, dirty);
    return isValid;
  }

  checkAsyncValidity(data, dirty, row, silentCheck) {
    return this.ready.then(() => {
      const promises = [super.checkAsyncValidity(data, dirty, row, silentCheck)];
      this.eachComponent((component) => promises.push(component.checkAsyncValidity(data, dirty, row, silentCheck)));
      return Promise.all(promises).then((results) => results.reduce((valid, result) => valid && result, true));
    });
  }

  setPristine(pristine) {
    super.setPristine(pristine);
    this.getComponents().forEach((comp) => comp.setPristine(pristine));
  }

  get isPristine() {
    return this.pristine && this.getComponents().every((c) => c.isPristine);
  }

  get errors() {
    const thisErrors = this.error ? [this.error] : [];
    return this.getComponents()
      .reduce((errors, comp) => errors.concat(comp.errors || []), thisErrors)
      .filter((err) => err.level !== 'hidden');
  }

  getValue() {
    return this.data;
  }

  resetValue() {
    super.resetValue();
    this.getComponents().forEach((comp) => comp.resetValue());
    this.setPristine(true);
  }

  get dataReady() {
    return Promise.all(this.getComponents().map((component) => component.dataReady));
  }

  setNestedValue(component, value, flags: any = {}) {
    component._data = this.componentContext(component);
    if (component.type === 'button') {
      return false;
    }
    if (component.type === 'components') {
      if (component.tree && component.hasValue(value)) {
        return component.setValue(_.get(value, component.key), flags);
      }
      return component.setValue(value, flags);
    } else if (value && component.hasValue(value)) {
      return component.setValue(_.get(value, component.key), flags);
    } else if ((!this.rootPristine || component.visible) && component.shouldAddDefaultValue) {
      flags.noValidate = !flags.dirty;
      flags.resetValue = true;
      return component.setValue(component.defaultValue, flags);
    }
  }

  setValue(value, flags: any = {}) {
    if (!value) {
      return false;
    }
    if (value.submitAsDraft && !value.submit) {
      flags.noValidate = true;
    }
    return this.getComponents().reduce((changed, component) => {
      return this.setNestedValue(component, value, flags) || changed;
    }, false);
  }

  get lazyLoad() {
    return this.component?.lazyLoad ?? false;
  }
}

export default FormioReactNestedComponent;
