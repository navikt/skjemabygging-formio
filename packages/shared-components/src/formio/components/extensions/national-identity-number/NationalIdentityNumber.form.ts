import { Components } from 'formiojs';
import baseEditForm = Components.baseEditForm;

const nationalIdentityNumberForm = () => {
  return baseEditForm([
    {
      key: 'display',
      components: [
        {
          // You can ignore existing fields.
          key: 'placeholder',
          ignore: true,
        },
        {
          key: 'tabindex',
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
          key: 'hidden',
          ignore: true,
        },
        {
          key: 'hideLabel',
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
      ],
    },
    {
      key: 'data',
      ignore: true,
      components: false,
    },
    {
      key: 'validation',
      ignore: true,
      components: false,
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
    {
      key: 'addons',
      ignore: true,
      components: false,
    },
  ]);
};

export default nationalIdentityNumberForm;
