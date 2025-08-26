import { Builders, Components, Displays, Formio, Utils } from '@formio/js';
// import BuilderUtils from '@formio/js/utils/builder';
import CustomComponents from '../../formio/components';
import Template from '../../formio/template';

const NavFormioJs = {
  Components,
  Formio,
  Builders,
  Utils,
  BuilderUtils: {}, // TODO /utils/builder eksponeres ikke lenger
  Displays,
};

NavFormioJs.Components.setComponents(CustomComponents);
NavFormioJs.Formio.use(Template);

export default NavFormioJs;
