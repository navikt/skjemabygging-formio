import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formio } from 'formiojs';
import FormioUtils from 'formiojs/utils';
import BuilderUtils from 'formiojs/utils/builder';

const WizardBuilder = Formio.Builders.builders.wizard;

// Using copyComponent instead doesn't work because the pasteComponent in WizardBuilder doesn't get from formio.clipboard
WizardBuilder.prototype.pasteComponent = function (component) {
  if (!window.sessionStorage) {
    return console.warn('Session storage is not supported in this browser.');
  }
  this.removeClass(this.refs.form, 'builder-paste-mode');
  if (window.sessionStorage) {
    const data = window.sessionStorage.getItem('formio.clipboard');
    if (data) {
      // Change from original: Enrich the component with navIds
      const schema = navFormUtils.enrichComponentsWithNavIds(
        [JSON.parse(data)],
        FormioUtils.getRandomComponentId,
        true,
      )[0];

      const parent = this.getParentElement(component.element);
      if (parent) {
        BuilderUtils.uniquify(this.findNamespaceRoot(parent.formioComponent), schema);
        let path = '';
        let index = 0;

        const isParentSaveChildMethod = this.isParentSaveChildMethod(parent.formioComponent);
        if (parent.formioContainer && !isParentSaveChildMethod) {
          index = parent.formioContainer.indexOf(component.component);
          path = this.getComponentsPath(schema, parent.formioComponent.component);
          parent.formioContainer.splice(index + 1, 0, schema);
        } else if (isParentSaveChildMethod) {
          parent.formioComponent.saveChildComponent(schema, false);
        }
        parent.formioComponent.rebuild();

        this.emitSaveComponentEvent(schema, schema, parent.formioComponent.component, path, index + 1, true, schema);
      }
      this.emit('change', this.form);
    }
  }
};
