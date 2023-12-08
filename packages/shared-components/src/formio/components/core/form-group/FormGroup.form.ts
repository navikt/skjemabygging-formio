import NestedComponentForm from 'formiojs/components/_classes/nested/NestedComponent.form';
import FieldsetDisplayForm from 'formiojs/components/fieldset/editForm/Fieldset.edit.display';
import { description } from '../../fields/description.js';

const formGroupForm = () => {
  return NestedComponentForm([
    {
      key: 'display',
      components: [
        ...FieldsetDisplayForm.filter((field) => field.key !== 'description'),
        ...description,
        {
          key: 'tooltip',
          ignore: true,
        },
        {
          key: 'tabindex',
          ignore: true,
        },
        {
          key: 'modalEdit',
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
          key: 'disabled',
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
    { key: 'addons', ignore: true },
    { key: 'logic', ignore: true },
    { key: 'layout', ignore: true },
  ]);
};

export default formGroupForm;
