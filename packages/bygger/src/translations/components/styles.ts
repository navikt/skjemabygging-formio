import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const sticky = {
  position: 'sticky',
  top: '0',
  backgroundColor: 'var(--ax-bg-default)',
  zIndex: '10000',
};
const useStickyStyles = makeStyles({
  filterRow: {
    ...sticky,
    top: '9.5rem',
  },
  unusedTranslations: {
    ...sticky,
    top: '8.5rem',
  },
  mainTable: {
    ...sticky,
    top: '12.5rem',
  },
});

const useTranslationTableStyles = makeStyles({
  table: {
    marginBottom: '4rem',
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
  inputAdditionalInfo: {
    marginTop: '0.5rem',
    lineHeight: '0.8rem',
    fontSize: '0.8rem',
    color: 'var(--ax-text-neutral-subtle)',
  },
});

export { useStickyStyles, useTranslationTableStyles };
