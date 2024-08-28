import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import NestedComponent from 'formiojs/components/_classes/nested/NestedComponent';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import InnerHtml from '../../../components/inner-html/InnerHtml';
import Ready from '../../../util/form/ready';
import FormioReactComponent from './FormioReactComponent';

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
    return super.render(`<div ref="react-${this.id}"></div>`);
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
    });

    if (this.refs[`react-${this.id}`]) {
      this.attachReact(this.refs[`react-${this.id}`], this.setReactInstance.bind(this));
      // if (this.shouldSetValue) {
      //   this.setValue(this.dataForSetting);
      //   this.updateValue(this.dataForSetting);
      // }
    }

    console.log('attach components nestedRef', this.nestedRef);
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
    this.nestedRef = ref;
    console.log('setNestedref', this.nestedRef, ref);
    this.attachComponents(this.nestedRef.current);
  }

  /**
   * To render a react component, override this function
   * and pass the jsx element as a param to element's render function
   */
  renderReact(_element) {}

  /**
   * Copy paste BaseComponent
   *
   *
   *
   *
   *
   */

  /**
   * Get id for custom component renderReact()
   */
  getId() {
    return `${this.component?.id}-${this.component?.key}`;
  }

  /**
   * Get label for custom component renderReact()
   */
  getLabel(options?: { showOptional?: boolean; showDiffTag?: boolean; labelTextOnly?: boolean }) {
    const defaultOptions = { showOptional: true, showDiffTag: true, labelTextOnly: false };
    const { showOptional, showDiffTag, labelTextOnly } = { ...defaultOptions, ...(options ?? {}) };

    if (labelTextOnly) return this.translate(this.component?.label ?? '');

    return (
      <>
        {this.translate(this.component?.label ?? '')}
        {this.isRequired() || !!this.component?.readOnly ? '' : showOptional && ` (${this.translate('valgfritt')})`}
        {showDiffTag && this.getDiffTag()}
      </>
    );
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
   * Set which component is currently focused, and optionally which element inside this component.
   * This is stored on 'this.root' which usually points to the webform/wizard.
   * @param component
   * @param elementName
   */
  setFocusedComponent(component: BaseComponent | null, elementName: any = null) {
    this.logger.trace(`setFocusedComponent ${component ? 'this' : 'null'}`, { elementName });
    this.root.focusedComponent = component;
    this.root.focusedElementName = elementName;
  }

  /**
   * @return Currently focused component.
   */
  getFocusedComponent() {
    return this.root.focusedComponent;
  }

  /**
   * @return Name of focused element inside currently focused component.
   */
  getFocusedElementName() {
    return this.root.focusedElementName;
  }

  /**
   * Copied from Formio Component#restoreFocus, and adjusted to our needs.
   * Invoked when component is being attached, e.g. during initial build or on rebuild/redraw.
   */
  restoreFocus() {
    const focusedComponent = this.getFocusedComponent();
    const isFocused = focusedComponent?.path === this.path;
    if (isFocused) {
      const focusedElementName = this.getFocusedElementName();
      this.logger.debug('restoreFocus isFocused', {
        elementName: focusedElementName,
        navId: this.component?.navId,
        type: this.component?.type,
      });
      this.focus({ focusedElementName });
    }
  }

  /**
   * Overrides Formio Component#addFocusBlurEvents. We split the focus and blur handlers
   * in order to be able to reuse them inside our React components.
   * @param element The element
   */
  addFocusBlurEvents(element) {
    this.addEventListener(element, 'focus', focusHandler(this));
    this.addEventListener(element, 'blur', blurHandler(this));
  }

  getHideLabel() {
    return this.component?.hideLabel ?? false;
  }

  /**
   * Get description for custom component renderReact()
   */
  getDescription(): ReactNode {
    return this.component?.description ? (
      <InnerHtml content={this.translate(this.component?.description)} />
    ) : undefined;
  }

  getValueDescription(index: number) {
    return this.translate(this.component?.values?.[index]?.description);
  }

  /**
   * Get class name for custom component renderReact()
   */
  getClassName() {
    // TODO: Remove nav-new and nav- prefix for fieldsize when all components are Aksel
    return this.component?.fieldSize ? `nav-${this.component?.fieldSize} nav-new` : 'nav-new';
  }

  /**
   * Get whether custom component is required renderReact()
   */
  isRequired() {
    return this.component?.validate?.required;
  }

  /**
   * Get content for custom component renderReact()
   */
  getContent() {
    return this.component?.content ? this.translate(this.component?.content) : '';
  }

  /**
   * Get auto complete for custom component renderReact()
   */
  getAutoComplete() {
    return this.component?.autoComplete ?? 'off';
  }

  /**
   * Get language code for custom component renderReact()
   */
  getLocale() {
    return this.root.i18next.language;
  }

  /**
   * Get read only for custom component renderReact()
   */
  getReadOnly() {
    return this.component?.readOnly || this.options.readOnly;
  }

  /**
   * Get spell check for custom component renderReact()
   */
  getSpellCheck() {
    return this.component?.spellCheck;
  }

  /**
   * Get error custom for component renderReact()
   */
  getError() {
    return this.error?.message;
  }

  /**
   * Get whether user is logged in or not for custom component renderReact()
   */
  getIsLoggedIn() {
    return this.options?.appConfig?.config?.isLoggedIn;
  }

  /**
   * Get textDisplay tag for custom component renderReact()
   */
  getTextDisplayTag() {
    if (!this.builderMode) {
      return <></>;
    }

    if (this.component?.textDisplay === 'pdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          PDF
        </Tag>
      );
    } else if (this.component?.textDisplay === 'formPdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          Skjema og PDF
        </Tag>
      );
    }
  }

  // /**
  //  * Used to set focus when clicking error summary, and when restoring focus after rerender.
  //  */
  // focus(focusData: any = {}) {
  //   this.logger.debug('focus', { focusData });
  //   this.reactReady.then(() => {
  //     this.logger.debug('focus reactReady', { focusData, reactInstanceExists: !!this.reactInstance });
  //     const { elementId } = focusData;
  //     if (elementId) {
  //       this.getRef(elementId)?.focus();
  //     } else if (this.reactInstance) {
  //       this.reactInstance.focus(focusData);
  //     }
  //   });
  // }

  /**
   * Required and used by Form.io
   */
  get defaultSchema() {
    return (this.constructor as typeof FormioReactComponent).schema();
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
   * Private function
   *
   * Create a diff <Tag> that is used in the label for the custom component.
   */
  getDiffTag() {
    const publishedForm = this.options?.formConfig?.publishedForm;
    if (!this.builderMode || !publishedForm) {
      return <></>;
    }

    const diff = formDiffingTool.generateComponentDiff(this.component!, publishedForm, this.getEditFields());

    return (
      <>
        {diff.isNew && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Ny
          </Tag>
        )}
        {diff.changesToCurrentComponent?.length > 0 && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Endring
          </Tag>
        )}
        {diff.deletedComponents?.length > 0 && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Slettede elementer
          </Tag>
        )}
      </>
    );
  }

  // elementId is used to focus to the correct element when clicking on error summary
  // Message is the error message that is shown in the error summary
  // addError(message: string, elementId?: string) {
  //   this.logger.debug('addError', { errorMessage: message });
  //   this.componentErrors.push(this.createError(message, elementId));
  // }
  //
  // createError(message: string, elementId?: string): ComponentError {
  //   return {
  //     message,
  //     level: 'error',
  //     path: FormioUtils.getComponentPath(this.component),
  //     elementId,
  //   };
  // }
  //
  // removeAllErrors() {
  //   this.componentErrors = [];
  // }
}

export default FormioReactNestedComponent;
