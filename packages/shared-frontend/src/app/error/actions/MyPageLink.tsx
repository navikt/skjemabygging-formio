import { Link } from '@navikt/ds-react';
import { stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { navUrls } from '../navUrls';
import { ErrorContentProps } from '../types';

const MyPageLink = ({ translate, locale }: ErrorContentProps) => (
  <Link href={navUrls.MY_PAGE(locale)}>{stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}</Link>
);

export { MyPageLink };
