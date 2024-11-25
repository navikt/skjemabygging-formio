import { Formio, Utils } from 'formiojs';
import focusOnComponent from './focusOnComponent';

const Wizard = Formio.Displays.displays.wizard;
const WebForm = Formio.Displays.displays.webform;

Wizard.prototype.emitNextPage = function () {
  this.emit('nextPage', { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};
Wizard.prototype.emitPrevPage = function () {
  this.emit('prevPage', { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};

WebForm.prototype.cancel = function () {
  this.emit('cancel', { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};

Wizard.prototype.attach = function (element) {
  this.element = element;
  this.loadRefs(element, {
    [this.wizardKey]: 'single',
    [`${this.wizardKey}-cancel`]: 'single',
    [`${this.wizardKey}-save`]: 'single',
    [`${this.wizardKey}-previous`]: 'single',
    [`${this.wizardKey}-next`]: 'single',
    [`${this.wizardKey}-submit`]: 'single',
    [`${this.wizardKey}-link`]: 'multiple',
    [`${this.wizardKey}-tooltip`]: 'multiple',
    [`${this.wizardKey}-header`]: 'single',
    [`${this.wizardKey}-stepper`]: 'single',
    [`${this.wizardKey}-stepper-open`]: 'single',
    [`${this.wizardKey}-stepper-close`]: 'single',
    [`${this.wizardKey}-stepper-backdrop`]: 'single',
    [`${this.wizardKey}-stepper-summary`]: 'single',
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
  this.attachNav();
  this.attachHeader();

  return promises.then(() => {
    this.emit('render', { component: this.currentPage, page: this.page });
    if (this.component.scrollToTop) {
      this.scrollPageToTop();
    }
  });
};

Wizard.prototype.attachCustomNavigationEvents = function () {
  const saveButton = this.refs[`${this.wizardKey}-save`];
  const onSave = () => {
    this.emit('save', { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
  };
  this.addEventListener(saveButton, 'click', onSave);
};

Wizard.prototype.detachCustomNavigationEvents = function () {
  const saveButton = this.refs[`${this.wizardKey}-save`];
  this.removeEventListener(saveButton, 'click');
};

// Override original attachNav, in order to add custom events (like save)
Wizard.prototype.attachNav = function () {
  if (this.component.navigateOnEnter) {
    this.addEventListener(document, 'keyup', this.handleNaviageteOnEnter.bind(this));
  }
  if (this.component.saveOnEnter) {
    this.addEventListener(document, 'keyup', this.handleSaveOnEnter.bind(this));
  }

  Object.values(this.buttons).forEach((button) => {
    const buttonElement = this.refs[`${this.wizardKey}-${button.name}`];
    this.addEventListener(buttonElement, 'click', (event) => {
      event.preventDefault();

      // Disable the button until done.
      buttonElement.setAttribute('disabled', 'disabled');
      this.setLoading(buttonElement, true);

      // Call the button method, then re-enable the button.
      this[button.method]()
        .then(() => {
          buttonElement.removeAttribute('disabled');
          this.setLoading(buttonElement, false);
        })
        .catch(() => {
          buttonElement.removeAttribute('disabled');
          this.setLoading(buttonElement, false);
        });
    });
  });

  this.attachCustomNavigationEvents();
};

// Override original detachNav, in order to add custom events (like save)
Wizard.prototype.detachNav = function () {
  if (this.component.navigateOnEnter) {
    this.removeEventListener(document, 'keyup', this.handleNaviageteOnEnter.bind(this));
  }
  if (this.component.saveOnEnter) {
    this.removeEventListener(document, 'keyup', this.handleSaveOnEnter.bind(this));
  }
  Object.values(this.buttons).forEach((button) => {
    this.removeEventListener(this.refs[`${this.wizardKey}-${button.name}`], 'click');
  });
  this.detachCustomNavigationEvents();
};

Wizard.prototype.redrawNavigation = function () {
  if (this.element) {
    let navElement = this.element.querySelector(`#${this.wizardKey}-nav-container`);
    if (navElement) {
      this.detachNav();
      navElement.outerHTML = this.renderTemplate('wizardNav', this.renderContext);
      navElement = this.element.querySelector(`#${this.wizardKey}-nav-container`);
      this.loadRefs(navElement, {
        [`${this.wizardKey}-cancel`]: 'single',
        [`${this.wizardKey}-save`]: 'single',
        [`${this.wizardKey}-previous`]: 'single',
        [`${this.wizardKey}-next`]: 'single',
        [`${this.wizardKey}-submit`]: 'single',
      });
      this.attachNav();
    }
  }
};

Wizard.prototype.attachStepper = function () {
  const stepperOpenButton = this.refs[`${this.wizardKey}-stepper-open`];
  const stepperBackdrop = this.refs[`${this.wizardKey}-stepper-backdrop`];
  const stepperCloseButton = this.refs[`${this.wizardKey}-stepper-close`];
  const stepper = this.refs[`${this.wizardKey}-stepper`];
  const openStepper = () => {
    this.isStepperOpen = true;
    stepper.classList.add('stepper--open');
    stepperBackdrop.style.display = 'block';
    stepperCloseButton.focus();
  };
  const closeStepper = () => {
    this.isStepperOpen = false;
    stepper.classList.remove('stepper--open');
    stepperBackdrop.style.display = 'none';
    stepperOpenButton.focus();
  };

  this.addEventListener(stepperOpenButton, 'click', openStepper);
  this.addEventListener(stepperCloseButton, 'click', closeStepper);
  this.addEventListener(stepperBackdrop, 'click', closeStepper);
};

Wizard.prototype.detachStepper = function () {
  const stepperOpenButton = this.refs[`${this.wizardKey}-stepper-open`];
  const stepperBackdrop = this.refs[`${this.wizardKey}-stepper-backdrop`];
  const stepperCloseButton = this.refs[`${this.wizardKey}-stepper-close`];
  this.removeEventListener(stepperOpenButton, 'click');
  this.removeEventListener(stepperBackdrop, 'click');
  this.removeEventListener(stepperCloseButton, 'click');
};

Wizard.prototype.redrawHeader = function () {
  if (this.element) {
    let headerElement = this.element.querySelector(`#${this.wizardKey}-header`);
    if (headerElement) {
      this.detachHeader();
      headerElement.outerHTML = this.renderTemplate('wizardHeader', this.renderContext);
      headerElement = this.element.querySelector(`#${this.wizardKey}-header`);
      this.loadRefs(headerElement, {
        [`${this.wizardKey}-link`]: 'multiple',
        [`${this.wizardKey}-tooltip`]: 'multiple',
        [`${this.wizardKey}-stepper`]: 'single',
        [`${this.wizardKey}-stepper-open`]: 'single',
        [`${this.wizardKey}-stepper-close`]: 'single',
        [`${this.wizardKey}-stepper-backdrop`]: 'single',
        [`${this.wizardKey}-stepper-summary`]: 'single',
      });
      this.attachHeader();
    }
  }
};

// Overridden to re-set focus to the link after clicking on it, as a re-render will reset focus to the top of the page.
Wizard.prototype.attachHeader = function () {
  const isAllowPrevious = this.isAllowPrevious();

  if (this.isBreadcrumbClickable() || isAllowPrevious) {
    this.refs[`${this.wizardKey}-link`].forEach((link, index) => {
      if (!isAllowPrevious || index <= this.enabledIndex) {
        this.addEventListener(link, 'click', (event) => {
          this.emit('wizardNavigationClicked', this.pages[index]);
          event.preventDefault();
          return this.setPage(index)
            .then(() => {
              this.emitWizardPageSelected(index);
            })
            .then(() => {
              this.refs[`${this.wizardKey}-link`][index].focus();
            });
        });
      }
    });
  }

  // Copy of nextPage() from formio.js/src/Wizard.js, but without custom emit and scroll to errors
  const validateAndGoToNextPage = (emitPage) => {
    this.currentPage.showErrormessages = true;

    if (this.options.readOnly) {
      return this.beforePage(true).then(() => {
        if (emitPage) {
          return this.setPage(this.getNextPage()).then(() => {
            this.emitNextPage();
          });
        } else {
          return this.setPage(this.getNextPage());
        }
      });
    }

    // Validate the form, before go to the next page
    if (this.checkValidity(this.localData, true, this.localData, true)) {
      this.checkData(this.submission.data);
      return this.beforePage(true).then(() => {
        return this.setPage(this.getNextPage()).then(() => {
          if (!(this.options.readOnly || this.editMode) && this.enabledIndex < this.page) {
            this.enabledIndex = this.page;
            this.redraw();
          }

          if (emitPage) {
            this.emitNextPage();
          }
        });
      });
    } else {
      this.currentPage.components.forEach((comp) => comp.setPristine(false));

      this.showErrors();
      setTimeout(() => this.emit('errorSummaryFocus'), 0);

      return Promise.reject(this.errors, true);
    }
  };

  Wizard.prototype.nextPage = () => {
    return validateAndGoToNextPage(true);
  };

  const validateUntilLastPage = () => {
    if (this.isLastPage()) {
      this.emit('submitButton'); // Validate entire form and go to summary page
    } else {
      validateAndGoToNextPage(false) // Use "nextPage" function, which validates current step and moves to next step if valid or display errors if invalid
        .then(validateUntilLastPage) // Repeat on next step in form
        .catch(() => {}); // Ignore rejected promise returned by nextPage() when there are errors. Those are handled by onError defined in FillInFormPage.
    }
  };

  const validateEveryStepInSuccessionBeforeSubmitting = (event) => {
    event.preventDefault();
    if (!this.checkValidity(this.localData, false, this.localData, false)) {
      // Validate entire form without triggering error messages
      this.setPage(0) // Start at first page
        .then(validateUntilLastPage); // Recursively visit every step, validate and move forward if valid
    } else {
      this.emit('submitButton'); // Go to summary page
    }
  };

  this.addEventListener(
    this.refs[`${this.wizardKey}-stepper-summary`],
    'click',
    validateEveryStepInSuccessionBeforeSubmitting,
  );

  this.attachStepper();
};

Wizard.prototype.detachHeader = function () {
  const links = this.refs[`${this.wizardKey}-link`];
  if (links !== undefined) {
    links.forEach((link) => {
      this.removeEventListener(link, 'click');
    });
  }
  this.removeEventListener(this.refs[`${this.wizardKey}-stepper-summary`], 'click');
  this.detachStepper();
};

const originalRebuild = Wizard.prototype.rebuild;
Wizard.prototype.rebuild = function () {
  const currentPage = this.page;
  const setCurrentPage = function () {
    this.setPage(currentPage);
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
};

/**
 * We take full control of the error summary, so this function does not invoke the original
 * showErrors in Webform.
 * @returns errors
 */
Wizard.prototype.showErrors = function () {
  const errs = this.getComponents()
    .reduce((errors, comp) => errors.concat(comp.errors || []), [])
    .filter((err) => err.level !== 'hidden')
    .map((err) => {
      return {
        message: err.message || err.messages?.[0]?.message,
        path: err.path || Utils.getStringFromComponentPath(err.messages?.[0]?.path),
        elementId: err.elementId,
      };
    });
  this.hasErrors = errs.length > 0;
  this.emit('showErrors', errs);
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
