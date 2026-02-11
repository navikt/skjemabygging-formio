import makeStyles from '../../../../util/styles/jss/jss';

const useFormInputStyles = makeStyles({
  'input--xxs': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '35px',
    },
  },
  'input--xs': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '70px',
    },
  },
  'input--s': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '140px',
    },
  },
  'input--m': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '210px',
    },
  },
  'input--l': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '280px',
    },
  },
  'input--xl': {
    '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
      width: '100%',
      maxWidth: '350px',
    },
  },
  '& .aksel-text-field__input, & .aksel-select__container, & .aksel-textarea__input': {
    width: '100%',
    maxWidth: '420px',
  },
});

type FormInputWidth = 'input--xxs' | 'input--xs' | 'input--s' | 'input--m' | 'input--l' | 'input--xl' | 'input--xxl';

export { useFormInputStyles };
export type { FormInputWidth };
