// @ts-nocheck
import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

class WebformBuilder extends NavFormioJs.Builders.builders.webform {
  removeComponent(component, parent, original) {
    if (!parent) {
      return;
    }
    let skipRemoveConfirm = component.skipRemoveConfirm ?? false;
    if (original && original.id) {
      let confirmationMessage;
      if (original.isAttachmentPanel) {
        confirmationMessage =
          'Du forsøker nå å slette vedleggspanelet. For å gjenopprette må et predefinert vedleggspanel trekkes inn. Vil du fremdeles slette panelet?';
        skipRemoveConfirm = true;
      } else {
        const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
        if (dependentComponents.length > 0) {
          confirmationMessage =
            'En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?';
          skipRemoveConfirm = true;
        }
      }

      if (confirmationMessage && !window.confirm(this.t(confirmationMessage))) {
        return false;
      }
    }
    return super.removeComponent({ ...component, skipRemoveConfirm }, parent, original);
  }

  editComponent(component, parent, isNew, isJsonEdit, original, flags = {}) {
    if (!component.key) {
      return;
    }
    if (original && original.id) {
      this.conditionalAlert = null;
      const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
      if (dependentComponents.length > 0) {
        this.conditionalAlert = {
          message: 'Følgende komponenter har avhengighet til denne:',
          components: dependentComponents,
        };
      }
    }
    if (original && original.key && this.options.formConfig) {
      this.navFormDiff = null;
      const { publishedForm } = this.options.formConfig;
      if (publishedForm) {
        const diff = formDiffingTool.getComponentDiff(original, publishedForm);
        if (diff.changesToCurrentComponent.length || diff.deletedComponents.length) {
          this.navFormDiff = diff;
        }
      }
    }

    super.editComponent(component, parent, isNew, isJsonEdit, original, flags);

    if (isJsonEdit) {
      this.editForm.form = {
        ...this.editForm.form,
        components: [
          {
            type: 'formioTextArea',
            as: 'json',
            editor: 'ace',
            input: true,
            key: 'componentJson',
            label: 'JSON definisjon',
            validate: {
              required: true,
            },
          },
          {
            type: 'checkbox',
            key: 'showFullSchema',
            label: 'Full definisjon',
          },
        ],
      };

      // Need to run this again to attach the edit components controls. In earlier FormioJS versions this was not necessary
      this.attachEditComponentControls(
        component,
        parent,
        isNew,
        original,
        NavFormioJs.Components.components[component.type],
      );
    }

    const saveButtons = this.componentEdit.querySelectorAll('[ref="saveButton"]');
    saveButtons.forEach((saveButton) => {
      this.editForm.removeEventListener(saveButton, 'click');
      this.editForm.addEventListener(saveButton, 'click', (event) => {
        event.preventDefault();
        // Need to set editFormDialogSaveClicked, to not trigger any error messages before user have tried to save.
        this.editForm.editFormDialogSaveClicked = true;
        if (!this.editForm.checkValidity(this.editForm.data, true, this.editForm.data)) {
          this.editForm.setPristine(false);
          this.editForm.showErrors();
          return false;
        }
        this.saved = true;
        this.saveComponent(component, parent, isNew, original);
      });
    });
  }

  destroy(...args) {
    this.conditionalAlert = null;
    this.navFormDiff = null;
    if (this.dialog) {
      this.dialog.close();
    }

    // This is a hack to get Formio to clean up.
    // Especially in React.Strict mode we get multiple warnings and Formio.forms never get destroyed.
    if (this.webform && !this.webform.initialized) {
      this.webform.initialized = true;
    }
    super.destroy(...args);
  }
}

export default WebformBuilder;
