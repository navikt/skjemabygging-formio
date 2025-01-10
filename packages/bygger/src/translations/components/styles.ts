import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useTranslationTableStyles = makeStyles({
  column: {
    width: '12rem',
    maxWidth: '12rem',
    alignContent: 'baseline',
  },
  clickableRow: {
    cursor: 'pointer',
  },
  displayCellIcon: {
    verticalAlign: 'text-top',
  },
});

export default useTranslationTableStyles;
