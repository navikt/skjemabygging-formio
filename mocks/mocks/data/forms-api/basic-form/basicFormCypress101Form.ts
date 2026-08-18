import { createCypress101Form, createCypress101Translations } from '../shared/createCypress101Form';

const basicFormCypress101Form = () => createCypress101Form({ path: 'basicformcypress101' });

const basicFormCypress101Translations = () => createCypress101Translations('basicformcypress101');

export { basicFormCypress101Form, basicFormCypress101Translations };
