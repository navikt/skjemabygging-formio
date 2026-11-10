import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { navUrls } from '../navUrls';
import { ErrorContentProps } from '../types';

const FrontPageButton = ({ translate, locale }: ErrorContentProps) => (
  <Button as="a" href={navUrls.BASE_URL(locale)}>
    {translate(TEXTS.statiske.error.goToFrontPage)}
  </Button>
);

export { FrontPageButton };
