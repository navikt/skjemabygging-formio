import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useTranslationTableStyles = makeStyles({
  table: {
    marginBottom: '4rem',
  },
  header: {
    position: 'sticky',
    top: '8.5rem',
    backgroundColor: 'var(--a-bg-default)',
    zIndex: '10000',
  },
  column: {
    width: '12rem',
    maxWidth: '12rem',
    alignContent: 'baseline',
    overflowWrap: 'break-word',
  },
  actionColumn: {
    width: '4rem',
    maxWidth: '4rem',
  },
  clickableRow: {
    cursor: 'pointer',
  },
  displayCellIcon: {
    verticalAlign: 'text-top',
  },
});

export default useTranslationTableStyles;
