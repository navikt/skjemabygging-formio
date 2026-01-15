import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useRecipientStyles = makeStyles({
  editRow: {
    border: 0,
    verticalAlign: 'baseline',
    '& .aksel-form-field': {
      paddingTop: '0.5rem',
    },
  },
  columnSmall: {
    width: '4rem',
  },
  columnLarge: {
    width: '18rem',
  },
});
export default useRecipientStyles;
