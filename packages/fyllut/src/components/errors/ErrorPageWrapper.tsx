import { Box, Page, VStack } from '@navikt/ds-react';
import { LanguagesProvider, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode, useEffect, useState } from 'react';
import { loadGlobalTranslationsForLanguages } from '../../util/api';

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
            <Box paddingBlock="20 8">
              <VStack gap="16">
                <VStack gap="8" align="start">
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
