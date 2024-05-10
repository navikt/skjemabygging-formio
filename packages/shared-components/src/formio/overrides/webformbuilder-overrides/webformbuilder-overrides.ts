import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formio } from 'formiojs';
import FormioUtils from 'formiojs/utils';

// @ts-ignore
const WizardBuilder = Formio.Builders.builders.wizard;
// @ts-ignore
const WebformBuilder = Formio.Builders.builders.webform;

// WizardBuilder uses the "addPage" function to pate component which doesn't use the formio clipboard
WizardBuilder.prototype.pasteComponent = function (component) {
  WebformBuilder.prototype.pasteComponent.call(this, component);
};

WebformBuilder.prototype.copyComponent = function (component) {
  if (!window.sessionStorage) {
    return console.warn('Session storage is not supported in this browser.');
  }
  this.addClass(this.refs.form, 'builder-paste-mode');

  // Change from original copyComponent: Use new navIds for all components
  const schema = navFormUtils.enrichComponentsWithNavIds(
    [component.schema],
    FormioUtils.getRandomComponentId,
    true,
  )?.[0];

  window.sessionStorage.setItem('formio.clipboard', JSON.stringify(schema));
};

// Show error message when key/navId is not unique
WebformBuilder.prototype.highlightInvalidComponents = function () {
  const findRepeatableNavIdPaths = () => {
    const duplicateNavIdPaths = new Set<string>(); // paths of components with duplicate navIds
    const navIdPaths = new Map<string, string[]>(); // navId -> paths

    // Create a map of navId -> paths
    FormioUtils.eachComponent(
      this.form.components,
      (comp: Component, path: string) => {
        if (!comp.navId) {
          return;
        }

        if (navIdPaths.has(comp.navId)) {
          const paths = navIdPaths.get(comp.navId) as string[];
          navIdPaths.set(comp.navId, [...paths, path]);
        } else {
          navIdPaths.set(comp.navId, [path]);
        }
      },
      true,
    );

    // Find paths where two or more components have the same navId
    navIdPaths.forEach((paths) => {
      if (paths.length >= 2) {
        paths.forEach((path) => duplicateNavIdPaths.add(path));
      }
    });

    return Array.from(duplicateNavIdPaths);
  };

  const repeatableNavidsPaths = findRepeatableNavIdPaths();
  const repeatablePaths = this.findRepeatablePaths();

  let hasInvalidComponents = false;

  // Show error message
  this.webform.everyComponent((comp) => {
    const path = comp.path;
    if (repeatablePaths.includes(path)) {
      comp.setCustomValidity(`API Key må være unik: ${comp.key}`);
      hasInvalidComponents = true;
    }
    if (repeatableNavidsPaths.includes(path)) {
      comp.setCustomValidity('NavId må være unik');
      hasInvalidComponents = true;
    }
    if (repeatableNavidsPaths.includes(path) && repeatablePaths.includes(path)) {
      comp.setCustomValidity('API Key og NavId må være unike');
      hasInvalidComponents = true;
    }
  });

  this.emit('builderFormValidityChange', hasInvalidComponents);
};
