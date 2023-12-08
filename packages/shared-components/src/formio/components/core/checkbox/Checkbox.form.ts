import CheckboxEditForm from 'formiojs/components/checkbox/Checkbox.form';
import { advancedDescription } from '../../fields/advancedDescription.js';

const checkboxForm = () => {
  return CheckboxEditForm([
    {
      label: 'Display',
      key: 'display',
      components: [
        ...advancedDescription,
        {
          key: 'tooltip',
          ignore: true,
        },
        {
          key: 'shortcut',
          ignore: true,
        },
        {
          key: 'inputType',
          ignore: true,
        },
        {
          key: 'customClass',
          ignore: true,
        },
        {
          key: 'tabindex',
          ignore: true,
        },
        {
          key: 'hidden',
          ignore: true,
        },
        {
          key: 'autofocus',
          ignore: true,
        },
        {
          key: 'disabled',
          ignore: true,
        },
        {
          key: 'tableView',
          ignore: true,
        },
        {
          key: 'modalEdit',
          ignore: true,
        },
        { key: 'labelWidth', ignore: true },
        { key: 'labelMargin', ignore: true },
        { key: 'hideLabel', ignore: true },
      ],
    },
    {
      key: 'data',
      ignore: true,
      components: [
        {
          key: 'multiple',
          ignore: true,
        },
        {
          key: 'persistent',
          ignore: true,
        },
        {
          key: 'inputFormat',
          ignore: true,
        },
        {
          key: 'protected',
          ignore: true,
        },
        {
          key: 'dbIndex',
          ignore: true,
        },
        {
          key: 'case',
          ignore: true,
        },
        {
          key: 'encrypted',
          ignore: true,
        },
        {
          key: 'redrawOn',
          ignore: true,
        },
        {
          key: 'calculateServer',
          ignore: true,
        },
        {
          key: 'allowCalculateOverride',
          ignore: true,
        },
      ],
    },
    {
      key: 'validation',
      components: [
        { key: 'validate.customMessage', ignore: true },
        { key: 'errorLabel', ignore: true },
        { key: 'unique', ignore: true },
        { key: 'validateOn', ignore: true },
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
      key: 'logic',
      ignore: true,
      components: false,
    },
    {
      key: 'layout',
      ignore: true,
      components: false,
    },
  ]);
};

export default checkboxForm;
