import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useRecipientStyles = makeStyles({
  editRow: {
    border: 0,
    verticalAlign: 'baseline',
    '& .navds-form-field': {
      paddingTop: '8px',
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
