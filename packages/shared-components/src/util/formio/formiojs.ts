import { Builders, Components, Formio, Utils } from 'formiojs';
import CustomComponents from '../../formio/components';
import Template from '../../formio/template';

const NavFormioJs = {
  Components,
  Formio,
  Builders,
  Utils,
};

NavFormioJs.Components.setComponents(CustomComponents);
NavFormioJs.Formio.use(Template);

export default NavFormioJs;
