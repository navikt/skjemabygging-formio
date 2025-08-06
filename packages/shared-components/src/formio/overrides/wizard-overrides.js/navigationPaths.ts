import { Webform } from '@navikt/skjemadigitalisering-shared-domain';

const getNavigationPaths = ({ currentPanels, page, currentNextPage }: Webform) => ({
  prev: currentPanels?.[page - 1] ?? null,
  curr: currentPanels?.[page] ?? null,
  next: currentPanels?.[currentNextPage] ?? null,
});

export const emitNavigationPathsChanged = (wizard: Webform) => {
  wizard.emit('navigationPathsChanged', getNavigationPaths(wizard));
};
