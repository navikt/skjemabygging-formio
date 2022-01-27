import { Formio } from "formiojs";
import { scrollToAndSetFocus } from "../util/focus-management";

const Wizard = Formio.Displays.displays.wizard;
const WebForm = Formio.Displays.displays.webform;
const originalNextPage = Wizard.prototype.nextPage;
const originalSubmit = Wizard.prototype.submit;

WebForm.prototype.cancel = function (noconfirm) {
  const shouldReset = this.hook("beforeCancel", true);
  // eslint-disable-next-line no-restricted-globals
  if (shouldReset && (noconfirm || confirm(this.t("Er du sikker på at du vil avbryte?")))) {
    this.resetValue();
    return true;
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
    [`${this.wizardKey}-stepindicator-next`]: "single",
    [`${this.wizardKey}-stepindicator-previous`]: "single",
    [`${this.wizardKey}-tooltip`]: "multiple",
  });
  if ((this.options.readOnly || this.editMode) && !this.enabledIndex) {
    if (this.pages) {
      this.enabledIndex = this.pages.length - 1;
    }
  }

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
        [`${this.wizardKey}-stepindicator-next`]: "single",
        [`${this.wizardKey}-stepindicator-previous`]: "single",
      });
      this.attachHeader();
    }
  }
};

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
              document.querySelector(".stegindikator__steg-inner--aktiv").focus();
            });
        });
      }
    });
  }

  const previousRefId = `${this.wizardKey}-stepindicator-previous`;
  const nextRefId = `${this.wizardKey}-stepindicator-next`;
  const addPageSwitchFunction = (newPage, nextOrPreviousRefId) => {
    this.addEventListener(this.refs[nextOrPreviousRefId], "click", (event) => {
      this.emit("wizardNavigationClicked", newPage);
      event.preventDefault();
      return this.setPage(newPage)
        .then(() => {
          this.emitWizardPageSelected(newPage);
        })
        .then(() => {
          const nextOrPreviousButton = document.querySelector(`[ref='${nextOrPreviousRefId}']`);

          if (nextOrPreviousButton) {
            nextOrPreviousButton.focus();
          } else if (nextOrPreviousRefId === previousRefId) {
            document.querySelector(".stegindikator__steg:first-of-type .stegindikator__steg-inner").focus();
          } else if (nextOrPreviousRefId === nextRefId) {
            document.querySelector(".stegindikator__steg:last-of-type .stegindikator__steg-inner").focus();
          }
        });
    });
  };
  addPageSwitchFunction(this.getPreviousPage(), previousRefId);
  addPageSwitchFunction(this.getNextPage(), nextRefId);
};

Wizard.prototype.detachHeader = function () {
  const links = this.refs[`${this.wizardKey}-link`];
  if (links !== undefined) {
    links.forEach((link) => {
      this.removeEventListener(link, "click");
    });
  }
  const previousButton = this.refs[`${this.wizardKey}-stepindicator-previous`];
  if (previousButton) {
    this.removeEventListener(previousButton, "click");
  }
  const nextButton = this.refs[`${this.wizardKey}-stepindicator-next`];
  if (nextButton) {
    this.removeEventListener(nextButton, "click");
  }
};

function overrideFormioWizardNextPageAndSubmit(loggSkjemaStegFullfort, loggSkjemaValideringFeilet) {
  Wizard.prototype.nextPage = function () {
    return originalNextPage
      .call(this)
      .then((returnValue) => {
        loggSkjemaStegFullfort();
        return returnValue;
      })
      .catch((error) => {
        scrollToAndSetFocus("div[id^='error-list-'] li:first-of-type");
        loggSkjemaValideringFeilet();
        return Promise.reject(error);
      });
  };
  Wizard.prototype.submit = function () {
    return originalSubmit
      .call(this)
      .then((returnValue) => {
        loggSkjemaStegFullfort();
        return returnValue;
      })
      .catch((error) => {
        scrollToAndSetFocus("div[id^='error-list-'] li:first-of-type");
        loggSkjemaValideringFeilet();
        return Promise.reject(error);
      });
  };
}

export { overrideFormioWizardNextPageAndSubmit };
