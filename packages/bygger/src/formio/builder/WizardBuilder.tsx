import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

class WizardBuilder extends NavFormioJs.Builders.builders.wizard {
  constructor(...args) {
    super(...args);

    // remove WizardBuilder's default 'saveComponent' eventListener
    this.off('saveComponent');

    // add custom 'saveComponent' event listener fallbacking to looking for panel based on id instead of key
    // Wizard pages don't replace themselves in the right array. Do that here.
    this.on(
      'saveComponent',
      (component, originalComponent) => {
        const webformComponents = this.webform.components.map(({ component }) => component);
        if (this._form.components.includes(originalComponent)) {
          this._form.components[this._form.components.indexOf(originalComponent)] = component;
          this.rebuild();
        } else if (webformComponents.includes(originalComponent)) {
          this._form.components.push(component);
          this.rebuild();
        } else {
          // BUGFIX: Fallback to look for panel based on id, not key which the original event listener does
          const formComponentIndex = this._form.components.findIndex((comp) => originalComponent.id === comp.id);
          if (formComponentIndex !== -1) {
            this._form.components[formComponentIndex] = component;
            this.rebuild();
          }
        }
      },
      true,
    );
  }

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

export default WizardBuilder;
