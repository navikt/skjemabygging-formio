import baseEditForm from 'formiojs/components/_classes/component/Component.form';
import { advancedDescription } from '../../fields/advancedDescription.js';

const accountNumberForm = () => {
  return baseEditForm([
    {
      key: 'display',
      components: [
        ...advancedDescription,
        { key: 'placeholder', ignore: true },
        { key: 'tabindex', ignore: true },
        { key: 'tooltip', ignore: true },
        { key: 'customClass', ignore: true },
        { key: 'hidden', ignore: true },
        { key: 'hideLabel', ignore: true },
        { key: 'autofocus', ignore: true },
        { key: 'disabled', ignore: true },
        { key: 'tableView', ignore: true },
        { key: 'modalEdit', ignore: true },
        { key: 'labelPosition', ignore: true },
      ],
    },
    {
      key: 'api',
      components: [
        { key: 'tags', ignore: true },
        { key: 'properties', ignore: true },
      ],
    },
    {
      key: 'validation',
      components: [
        { key: 'validateOn', ignore: true },
        { key: 'unique', ignore: true },
        { key: 'errorLabel', ignore: true },
        { key: 'errors', ignore: true },
      ],
    },
    { key: 'data', ignore: true },
    { key: 'logic', ignore: true },
    { key: 'layout', ignore: true },
    { key: 'addons', ignore: true },
  ]);
};

export default accountNumberForm;
