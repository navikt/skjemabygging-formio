import { Box } from '@navikt/ds-react';

export function SectionWrapper(props: { children: React.ReactNode }) {
  return <Box paddingBlock="12 0">{props.children}</Box>;
}
