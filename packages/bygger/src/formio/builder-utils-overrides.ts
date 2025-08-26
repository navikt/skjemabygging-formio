// TODO /utils/builder eksponeres ikke lenger, komponenter må få en unik navId når de legges inn i skjemadefinisjonen
// import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
// import { Component } from '@navikt/skjemadigitalisering-shared-domain';
//
// const originalUniqify = NavFormioJs.BuilderUtils.uniquify;
// const { eachComponent, getRandomComponentId } = NavFormioJs.Utils;
//
// NavFormioJs.BuilderUtils.uniquify = function (container: Component[], component: Component) {
//   eachComponent(
//     [component],
//     (component: Component) => {
//       component.navId = getRandomComponentId();
//     },
//     true,
//   );
//
//   originalUniqify(container, component);
// };
