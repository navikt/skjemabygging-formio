import { createCypress101Form, createCypress101Translations } from '../shared/createCypress101Form';

const nationalIdentityNumberCypress101Form = () => createCypress101Form({ path: 'nationalidentitynumbercypress101' });

const nationalIdentityNumberCypress101Translations = () =>
  createCypress101Translations('nationalidentitynumbercypress101');

export { nationalIdentityNumberCypress101Form, nationalIdentityNumberCypress101Translations };
