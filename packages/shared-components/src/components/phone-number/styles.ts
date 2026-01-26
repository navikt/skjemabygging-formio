import makeStyles from '../../util/styles/jss/jss';

export const usePhoneNumberStyles = makeStyles({
  wrapper: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  fetchError: {
    marginTop: '0.75rem',
    maxWidth: '608px',
  },
  areaCodeSelectLong: {
    flex: 0.75,
    maxWidth: '5.5rem',
    minWidth: '4.75rem',
    '&.aksel-form-field': {
      gap: 0,
    },
    '& .aksel-select__inner': {
      minHeight: 'var(--input-min-height)',
    },
  },
  areaCodeSelectShort: {
    flex: 0.65,
    maxWidth: '4.75rem',
    minWidth: '4rem',
    '&.aksel-form-field': {
      gap: 0,
    },
    '& .aksel-select__inner': {
      minHeight: 'var(--input-min-height)',
    },
  },
  phoneNumber: {
    maxWidth: '30%',
    flex: 3,
    '&.aksel-form-field': {
      gap: 0,
    },
  },
  error: {
    marginTop: '0.5rem',
  },
});
