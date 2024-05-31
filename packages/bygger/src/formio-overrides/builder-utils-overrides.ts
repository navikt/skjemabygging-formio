import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const originalUniqify = NavFormioJs.BuilderUtils.uniquify;
const { eachComponent, getRandomComponentId } = NavFormioJs.Utils;

NavFormioJs.BuilderUtils.uniquify = function (container: Component[], component: Component) {
  console.log('asdf');
  eachComponent(
    [component],
    (component: Component) => {
      component.navId = getRandomComponentId();
    },
    true,
  );

  originalUniqify(container, component);
};
