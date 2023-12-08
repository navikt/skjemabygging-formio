import FormioSelectBoxesEditForm from 'formiojs/components/selectboxes/SelectBoxes.form';
import { advancedDescription } from '../../fields/advancedDescription.js';

const selectBoxesForm = () => {
  return FormioSelectBoxesEditForm([
    {
      label: 'Display',
      key: 'display',
      components: [
        ...advancedDescription,
        {
          key: 'labelPosition',
          ignore: true,
        },
        {
          key: 'optionsLabelPosition',
          ignore: true,
        },
        {
          key: 'tooltip',
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
          key: 'inline',
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
        {
          key: 'hideLabel',
          ignore: true,
        },
      ],
    },
    {
      key: 'data',
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
        {
          key: 'dataType',
          ignore: true,
        },
      ],
    },
    {
      key: 'validation',
      components: [
        {
          key: 'unique',
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

export default selectBoxesForm;
