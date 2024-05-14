import { Builders, Components, Formio, Utils } from 'formiojs';
import BuilderUtils from 'formiojs/utils/builder';
import CustomComponents from '../../formio/components';
import Template from '../../formio/template';

const NavFormioJs = {
  Components,
  Formio,
  Builders,
  Utils,
  BuilderUtils,
};

NavFormioJs.Components.setComponents(CustomComponents);
NavFormioJs.Formio.use(Template);

export default NavFormioJs;
