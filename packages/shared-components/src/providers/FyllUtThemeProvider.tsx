import '@navikt/ds-css/darkside';
import { Theme } from '@navikt/ds-react';
import { PropsWithChildren } from 'react';

const FyllUtThemeProvider = ({ children }: PropsWithChildren) => {
  return <Theme>{children}</Theme>;
};

export default FyllUtThemeProvider;
