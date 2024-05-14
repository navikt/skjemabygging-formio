import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const originalUniqify = NavFormioJs.BuilderUtils.uniquify;
const { eachComponent, getRandomComponentId } = NavFormioJs.Utils;

console.log('Builder utils imported');
NavFormioJs.BuilderUtils.uniquify = function (container, component: Component) {
  console.log('Uniquifying component', container, component);
  eachComponent(
    [component],
    (component: Component) => {
      component.navId = getRandomComponentId();
    },
    true,
  );

  originalUniqify(container, component);
};
