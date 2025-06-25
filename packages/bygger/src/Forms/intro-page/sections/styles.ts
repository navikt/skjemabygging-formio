import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const useSectionsCheckboxesStyles = makeStyles({
  padlockIcon: {
    verticalAlign: 'sub',
  },
  checkboxGroup: {
    margin: '0 var(--a-space-16) 0 0',
  },
});

export const useSectionsWrapperStyles = (noBorderBottom: boolean) =>
  makeStyles({
    container: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      borderBottom: noBorderBottom ? undefined : '1px solid var(--a-surface-neutral)',
    },
    rightColumn: {
      borderLeft: '1px solid var(--a-surface-neutral-subtle) ',
      paddingLeft: '2rem',
    },
  });

export const usePreviewStyles = makeStyles({
  accordion: {
    '--__ac-accordion-header-shadow-color': 'var(--a-transparent)',
  },
});
