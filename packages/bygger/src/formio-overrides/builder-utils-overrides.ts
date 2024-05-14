import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';
import BuilderUtils from 'formiojs/utils/builder';

const originalUniqify = BuilderUtils.uniquify;

console.log('Builder utils imported');
BuilderUtils.uniquify = function (container, component: Component) {
  console.log('Uniquifying component', container, component);
  FormioUtils.eachComponent(
    [component],
    (component) => {
      component.navId = FormioUtils.getRandomComponentId();
    },
    true,
  );

  originalUniqify(container, component);
};
