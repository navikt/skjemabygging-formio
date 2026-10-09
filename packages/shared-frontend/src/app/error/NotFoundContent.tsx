import { BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ErrorContentProps, ErrorHeadingProps } from './types';

const NotFoundContent = ({ translate, headingRef }: Omit<ErrorContentProps, 'locale'> & ErrorHeadingProps) => (
  <div>
    <Heading ref={headingRef} tabIndex={headingRef ? -1 : undefined} size="large" spacing>
      {translate(TEXTS.statiske.error.notFoundTitle)}
    </Heading>
    <BodyShort>{translate(TEXTS.statiske.error.notFoundMessage)}</BodyShort>
  </div>
);

export { NotFoundContent };
