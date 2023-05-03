import { Formio } from "formiojs";

const Wizard = Formio.Displays.displays.wizard;
const WebForm = Formio.Displays.displays.webform;

Wizard.prototype.emitNextPage = function () {
  this.emit("nextPage", { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};
Wizard.prototype.emitPrevPage = function () {
  this.emit("prevPage", { page: this.page, submission: this.submission, currentPanels: this.currentPanels });
};

WebForm.prototype.cancel = function () {
  const url = window.location.href.indexOf(".dev.nav.") > 0 ? "https://www.dev.nav.no" : "https://www.nav.no";
  this.emit("cancel", { page: this.page, submission: this.submission, currentPanels: this.currentPanels, url });
  const shouldReset = this.hook("beforeCancel", true);
  if (shouldReset) {
    window.location.href = url;
  } else {
    return false;
  }
};

Wizard.prototype.attach = function (element) {
  this.element = element;
  this.loadRefs(element, {
    [this.wizardKey]: "single",
    [`${this.wizardKey}-cancel`]: "single",
    [`${this.wizardKey}-previous`]: "single",
    [`${this.wizardKey}-next`]: "single",
    [`${this.wizardKey}-submit`]: "single",
    [`${this.wizardKey}-link`]: "multiple",
    [`${this.wizardKey}-tooltip`]: "multiple",
    [`${this.wizardKey}-header`]: "single",
    [`${this.wizardKey}-stepper`]: "single",
    [`${this.wizardKey}-stepper-open`]: "single",
    [`${this.wizardKey}-stepper-close`]: "single",
    [`${this.wizardKey}-stepper-backdrop`]: "single",
    [`${this.wizardKey}-stepper-summary`]: "single",
  });

  if ((this.options.readOnly || this.editMode) && !this.enabledIndex) {
    if (this.pages) {
      this.enabledIndex = this.pages.length - 1;
    }
  }

  this.hook("attachWebform", element, this);
  const promises = this.attachComponents(this.refs[this.wizardKey], [
    ...this.prefixComps,
    ...this.currentPage.components,
    ...this.suffixComps,
  ]);
  this.attachNav();
  this.attachHeader();

  return promises.then(() => {
    this.emit("render", { component: this.currentPage, page: this.page });
    if (this.component.scrollToTop) {
      this.scrollPageToTop();
    }
  });
};

Wizard.prototype.attachStepper = function () {
  const stepperOpenButton = this.refs[`${this.wizardKey}-stepper-open`];
  const stepperBackdrop = this.refs[`${this.wizardKey}-stepper-backdrop`];
  const stepperCloseButton = this.refs[`${this.wizardKey}-stepper-close`];
  const stepper = this.refs[`${this.wizardKey}-stepper`];
  const openStepper = () => {
    this.isStepperOpen = true;
    stepper.classList.add("stepper--open");
    stepperBackdrop.style.display = "block";
    stepperCloseButton.focus();
  };
  const closeStepper = () => {
    this.isStepperOpen = false;
    stepper.classList.remove("stepper--open");
    stepperBackdrop.style.display = "none";
    stepperOpenButton.focus();
  };

  this.addEventListener(stepperOpenButton, "click", openStepper);
  this.addEventListener(stepperCloseButton, "click", closeStepper);
  this.addEventListener(stepperBackdrop, "click", closeStepper);
};

Wizard.prototype.detachStepper = function () {
  const stepperOpenButton = this.refs[`${this.wizardKey}-stepper-open`];
  const stepperBackdrop = this.refs[`${this.wizardKey}-stepper-backdrop`];
  const stepperCloseButton = this.refs[`${this.wizardKey}-stepper-close`];
  this.removeEventListener(stepperOpenButton, "click");
  this.removeEventListener(stepperBackdrop, "click");
  this.removeEventListener(stepperCloseButton, "click");
};

Wizard.prototype.redrawHeader = function () {
  if (this.element) {
    let headerElement = this.element.querySelector(`#${this.wizardKey}-header`);
    if (headerElement) {
      this.detachHeader();
      headerElement.outerHTML = this.renderTemplate("wizardHeader", this.renderContext);
      headerElement = this.element.querySelector(`#${this.wizardKey}-header`);
      this.loadRefs(headerElement, {
        [`${this.wizardKey}-link`]: "multiple",
        [`${this.wizardKey}-tooltip`]: "multiple",
        [`${this.wizardKey}-stepper`]: "single",
        [`${this.wizardKey}-stepper-open`]: "single",
        [`${this.wizardKey}-stepper-close`]: "single",
        [`${this.wizardKey}-stepper-backdrop`]: "single",
        [`${this.wizardKey}-stepper-summary`]: "single",
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
        this.addEventListener(link, "click", (event) => {
          this.emit("wizardNavigationClicked", this.pages[index]);
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

  const validateAndGoToNextPage = () => {
    if (this.isLastPage()) {
      this.emit("submitButton"); // Validate entire form and go to summary page
    } else {
      this.nextPage() // Use "nextPage" function, which validates current step and moves to next step if valid or display errors if invalid
        .then(validateAndGoToNextPage) // Repeat on next step in form
        .catch(() => {}); // Ignore rejected promise returned by nextPage() when there are errors. Those are handled by onError defined in FillInFormPage.
    }
  };

  const validateEveryStepInSuccessionBeforeSubmitting = (event) => {
    event.preventDefault();
    if (!this.checkValidity(this.localData, false, this.localData, false)) {
      // Validate entire form without triggering error messages
      this.setPage(0) // Start at first page
        .then(validateAndGoToNextPage); // Recursively visit every step, validate and move forward if valid
    } else {
      this.emit("submitButton"); // Go to summary page
    }
  };

  this.addEventListener(
    this.refs[`${this.wizardKey}-stepper-summary`],
    "click",
    validateEveryStepInSuccessionBeforeSubmitting
  );

  this.attachStepper();
};

Wizard.prototype.detachHeader = function () {
  const links = this.refs[`${this.wizardKey}-link`];
  if (links !== undefined) {
    links.forEach((link) => {
      this.removeEventListener(link, "click");
    });
  }
  this.removeEventListener(this.refs[`${this.wizardKey}-stepper-summary`], "click");
  this.detachStepper();
};
