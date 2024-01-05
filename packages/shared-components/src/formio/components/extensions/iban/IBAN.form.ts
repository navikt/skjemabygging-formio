import TextFieldEditForm from 'formiojs/components/textfield/TextField.form';

const ibanForm = () => {
  return TextFieldEditForm([
    {
      key: 'display',
      components: [
        {
          key: 'prefix',
          ignore: true,
        },
        {
          key: 'suffix',
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
          key: 'showWordCount',
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
          key: 'widget.type',
          ignore: true,
        },
        { key: 'tooltip', ignore: true },
        { key: 'tabindex', ignore: true },
        { key: 'showCharCount', ignore: true },
        { key: 'mask', ignore: true },
        { key: 'autofocus', ignore: true },
        { key: 'spellcheck', ignore: true },
        { key: 'inputMask', ignore: true },
        { key: 'displayMask', ignore: true },
        { key: 'allowMultipleMasks', ignore: true },
        { key: 'disabled', ignore: true },
        { key: 'placeholder', ignore: true },
        { key: 'labelPosition', ignore: true },
        { key: 'autocomplete', ignore: true },
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
        { key: 'truncateMultipleSpaces', ignore: true },
        { key: 'clearOnHide', ignore: true },
        { key: 'unique', ignore: true },
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
        { key: 'validate.minLength', ignore: true },
        { key: 'validate.maxLength', ignore: true },
        { key: 'validate.minWords', ignore: true },
        { key: 'validate.maxWords', ignore: true },
        { key: 'validate.pattern', ignore: true },
        { key: 'validate.customMessage', ignore: true },
        { key: 'errorLabel', ignore: true },
        { key: 'unique', ignore: true },
        { key: 'validateOn', ignore: true },
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

export default ibanForm;
