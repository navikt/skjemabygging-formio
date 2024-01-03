import HTMLElementEditForm from 'formiojs/components/html/HTML.form';
import HTMLElementDisplayEditForm from 'formiojs/components/html/editForm/HTML.edit.display';
import { contentToIncludeInPdf } from '../../fields/contentToIncludeInPdf';

const alertForm = () => {
  return HTMLElementEditForm([
    {
      label: 'Display',
      key: 'display',
      components: [
        ...HTMLElementDisplayEditForm,
        contentToIncludeInPdf,
        {
          label: 'Type',
          type: 'radiopanel',
          key: 'alerttype',
          input: true,
          weight: 81,
          values: [
            {
              value: 'info',
              label: 'Info',
            },
            {
              value: 'success',
              label: 'Suksess',
            },
            {
              value: 'warning',
              label: 'Advarsel',
            },
            {
              value: 'error',
              label: 'Feil',
            },
          ],
        },
        {
          label: 'Inline',
          type: 'navCheckbox',
          key: 'isInline',
          input: true,
          weight: 82,
        },
        {
          key: 'label',
          ignore: true,
        },
        {
          key: 'className',
          ignore: true,
        },
        {
          key: 'attrs',
          ignore: true,
        },
        {
          key: 'tag',
          ignore: true,
        },
        {
          key: 'refreshOnChange',
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
          key: 'modalEdit',
          ignore: true,
        },
      ],
    },
    {
      key: 'api',
      components: [
        {
          key: 'properties',
          ignore: true,
        },
        {
          key: 'tags',
          ignore: true,
        },
      ],
    },
    {
      key: 'layout',
      ignore: true,
    },
    {
      key: 'logic',
      ignore: true,
    },
  ]);
};

export default alertForm;
