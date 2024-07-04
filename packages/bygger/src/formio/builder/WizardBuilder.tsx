import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';

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
}

export default WizardBuilder;
