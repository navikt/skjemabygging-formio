import { Formio, Utils } from 'formiojs';
import focusOnComponent from './focusOnComponent';
import { emitNavigationPathsChanged } from './navigationPaths';

const Wizard = Formio.Displays.displays.wizard;
const WebForm = Formio.Displays.displays.webform;

WebForm.prototype.cancel = function () {
  this.emit('cancel', { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};

// Overridden to avoid rendering header and navigation, as these are handled in React.
Wizard.prototype.render = function () {
  const ctx = this.renderContext;

  if (this.component.key) {
    ctx.panels.map((panel) => {
      if (panel.key === this.component.key) {
        this.currentPanel = panel;
      }
    });
  }

  return this.renderTemplate(
    'wizard',
    {
      ...ctx,
      className: this.getClassName(),
      components: this.renderComponents([...this.prefixComps, ...this.currentPage.components, ...this.suffixComps]),
    },
    this.builderMode ? 'builder' : 'form',
  );
};

// Overridden to avoid rendering header and navigation
Wizard.prototype.attach = function (element) {
  this.element = element;
  this.loadRefs(element, {
    [this.wizardKey]: 'single',
  });

  if ((this.options.readOnly || this.editMode) && !this.enabledIndex) {
    if (this.pages) {
      this.enabledIndex = this.pages?.length - 1;
    }
  }

  this.hook('attachWebform', element, this);
  const promises = this.attachComponents(this.refs[this.wizardKey], [
    ...this.prefixComps,
    ...this.currentPage.components,
    ...this.suffixComps,
  ]);

  return promises.then(() => {
    this.emit('render', { component: this.currentPage, page: this.page });
    this.emitNavigationPathsChanged();
    if (this.component.scrollToTop) {
      this.scrollPageToTop();
    }
  });
};

// Override original attachNav, in order to add custom events (like save)
Wizard.prototype.attachNav = function () {
  // navigation is handled in React
};

// Override original detachNav, in order to add custom events (like save)
Wizard.prototype.detachNav = function () {
  // navigation is handled in React
};

Wizard.prototype.redrawNavigation = function () {
  // navigation is handled in React
};

Wizard.prototype.redrawHeader = function () {
  // no header to redraw
};

// Overridden to re-set focus to the link after clicking on it, as a re-render will reset focus to the top of the page.
Wizard.prototype.attachHeader = function () {
  // no header should be attached
};

Wizard.prototype.detachHeader = function () {
  // no header to detach
};

Wizard.prototype.nextPage = () => {
  // navigation is handled in React
  return Promise.reject(new Error('nextPage should not be called directly'));
};

Wizard.prototype.prevPage = () => {
  // navigation is handled in React
  return Promise.reject(new Error('prevPage should not be called directly'));
};

Wizard.prototype.validateOnNextPage = function (validationResultCallback) {
  this.currentPage.nextPageClicked = true;
  const valid = this.checkValidity(this.localData, true, this.localData, true);
  if (validationResultCallback) {
    validationResultCallback(valid);
  }
  if (!valid) {
    // this.currentPage.components.forEach((comp) => comp.setPristine(false)); // <- nødvendig?

    this.showErrors();
    setTimeout(() => this.emit('errorSummaryFocus'), 0);
  }
};

const originalRebuild = Wizard.prototype.rebuild;
Wizard.prototype.rebuild = function () {
  const currentPage = this.page;
  const setCurrentPage = function () {
    this.setPage(currentPage);
    this.emitNavigationPathsChanged();
  };
  return originalRebuild.call(this).then(setCurrentPage.bind(this));
};

const originalOnChange = Wizard.prototype.onChange;
Wizard.prototype.onChange = function (flags, changed, modified, changes) {
  originalOnChange.call(this, flags, changed, modified, changes);
  /**
   * The original onChange function uses this.alert, but that will not be set anymore since we have
   * taken control over the error summary, so we use this.hasErrors instead which is set in showErrors.
   */
  if (this.hasErrors && !this.submitted) {
    // if submitted, invoking checkValidity is handled elsewhere
    this.checkValidity(this.localData, false, this.localData, true);
    this.showErrors();
  }
  this.emitNavigationPathsChanged();
};

Wizard.prototype.emitNavigationPathsChanged = function () {
  emitNavigationPathsChanged(this);
};

const getErrors = (components) => {
  return components
    .reduce((errors, comp) => errors.concat(comp.errors || []), [])
    .filter((err) => err.level !== 'hidden')
    .map((err) => {
      return {
        message: err.message || err.messages?.[0]?.message,
        path: err.path || Utils.getStringFromComponentPath(err.messages?.[0]?.path),
        elementId: err.elementId,
      };
    });
};

/**
 * We take full control of the error summary, so this function does not invoke the original
 * showErrors in Webform.
 * @returns errors
 */
Wizard.prototype.showErrors = function () {
  const errs = getErrors(this.getComponents());
  this.hasErrors = errs.length > 0;
  this.emit('showErrors', errs);
  return errs;
};

WebForm.prototype.showErrors = function () {
  const errs = getErrors(this.getComponents());
  const errorsList = this.renderTemplate('errorsList', { errors: errs });
  this.root.setAlert('danger', errorsList);
  const element = document.getElementById('error-summary');
  if (element) {
    element.focus();
  }
  return errs;
};

Wizard.prototype.focusOnComponent = function (arg) {
  focusOnComponent(this)(arg);
};

const originalOnSubmissionError = Wizard.prototype.onSubmissionError;
Wizard.prototype.onSubmissionError = function (error) {
  const result = originalOnSubmissionError.call(this, error);
  setTimeout(() => this.emit('errorSummaryFocus'), 0);
  return result;
};

const originalInit = Wizard.prototype.init;
Wizard.prototype.init = async function () {
  // Workaround to load submission on init in order to avoid flickering
  // Is fixed in 5.x, https://github.com/formio/formio.js/pull/4580
  if (this.options?.submission) {
    this._submission = this.options.submission;
    this._data = this.options.submission.data;
  } else {
    this._submission = this._submission || { data: {} };
  }
  const originalPromise = originalInit.call(this);
  // Set current page as early as possible to avoid flickering
  if (originalPromise && this.options?.panelSlug) {
    const originalResponseValue = await originalPromise;
    const panelIndex = this.currentPanels?.indexOf(this.options?.panelSlug);
    if (panelIndex >= 0) {
      await this.setPage(panelIndex);
    }
    return Promise.resolve(originalResponseValue);
  }
  return originalPromise;
};
