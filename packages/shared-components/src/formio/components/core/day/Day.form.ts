import { Formio } from '@formio/js';

const Day = Formio.Components.components.day;
const FormioDayEditForm = Day.editForm;

const alertForm = () => {
  return FormioDayEditForm([
    {
      label: 'Day',
      key: 'day',
      ignore: true,
    },
    {
      key: 'logic',
      ignore: true,
    },
    {
      key: 'layout',
      ignore: true,
    },
    {
      key: 'addons',
      ignore: true,
    },
    {
      key: 'display',
      components: [
        {
          key: 'hidden',
          ignore: true,
        },
        {
          key: 'tooltip',
          ignore: true,
        },
        {
          key: 'focus',
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
        {
          key: 'autofocus',
          ignore: true,
        },
        {
          key: 'tabindex',
          ignore: true,
        },
        {
          key: 'customClass',
          ignore: true,
        },
        {
          key: 'useLocaleSettings',
          ignore: true,
        },
        { key: 'disabled', ignore: true },
        { key: 'inputsLabelPosition', ignore: true },
        { key: 'hideInputLabels', ignore: true },
      ],
    },
    {
      key: 'data',
      components: [
        {
          key: 'protected',
          ignore: true,
        },
        {
          key: 'persistent',
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
        {
          key: 'customDefaultValuePanel',
          ignore: true,
        },
        {
          key: 'calculateValuePanel',
          ignore: true,
        },
        {
          key: 'clearOnHide',
          ignore: true,
        },
        {
          key: 'propertiesPanel',
          ignore: true,
        },
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
      components: [{ key: 'unique', ignore: true }],
    },
  ]);
};

export default alertForm;
