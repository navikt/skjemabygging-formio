import { Box, Page, VStack } from '@navikt/ds-react';
import { LanguagesProvider, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode, useEffect, useState } from 'react';
import { loadGlobalTranslationsForLanguages } from '../../api/useTranslations';

export function ErrorPageWrapper({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState({});

  const useStyles = makeStyles({
    maxContentWidth: {
      maxWidth: '960px',
      margin: '0 auto',
    },
  });

  const styles = useStyles();

  const fetchTranslations = async () => {
    const globalTranslations = await loadGlobalTranslationsForLanguages([]);
    setTranslations(globalTranslations);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return (
    <LanguagesProvider translations={translations}>
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
    </LanguagesProvider>
  );
}
