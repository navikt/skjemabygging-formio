import { Box, Page, VStack } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './ErrorPageLayout.module.css';

const ErrorPageLayout = ({ children }: { children: ReactNode }) => (
  <div className={styles.maxContentWidth}>
    <Page tabIndex={-1}>
      <Page.Block width="xl" gutters>
        <Box paddingBlock="space-80 space-32">
          <VStack gap="space-64">
            <VStack gap="space-32" align="start">
              {children}
            </VStack>
          </VStack>
        </Box>
      </Page.Block>
    </Page>
  </div>
);

export { ErrorPageLayout };
