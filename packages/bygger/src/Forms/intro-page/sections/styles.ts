import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const useSectionsCheckboxesStyles = makeStyles({
  padlockIcon: {
    verticalAlign: 'sub',
  },
  checkboxGroup: {
    margin: '0 var(--ax-space-16) 0 0',
  },
});

export const useSectionsWrapperStyles = (noBorderBottom: boolean) =>
  makeStyles({
    container: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      borderBottom: noBorderBottom ? undefined : '1px solid var(--ax-bg-neutral-strong)',
    },
    rightColumn: {
      borderLeft: '1px solid var(--ax-bg-neutral-soft) ',
      paddingLeft: '2rem',
    },
  });

export const usePreviewStyles = makeStyles({
  accordion: {
    '& .aksel-accordion__header::before, & .aksel-accordion__header::after': {
      backgroundColor: 'transparent',
    },
  },
});
