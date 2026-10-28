import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { Ref } from 'react';

// Error page parts take translate and locale as props so both the legacy language context and
// shared-frontend's LanguageProvider can render them.
interface ErrorContentProps {
  translate: TranslateFunction;
  locale: string;
}

interface ErrorHeadingProps {
  headingRef?: Ref<HTMLHeadingElement>;
}

export type { ErrorContentProps, ErrorHeadingProps };
