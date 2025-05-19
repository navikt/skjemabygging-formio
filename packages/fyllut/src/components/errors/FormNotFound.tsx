import { BodyShort, Box, Button, Heading, Link, Page, VStack } from '@navikt/ds-react';
import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router-dom';
import { PATHS } from '../../util/paths';

export function FormNotFoundPage() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';
  const location = useLocation();
  const url = location.state?.url;

  return (
    <Page tabIndex={-1}>
      <Page.Block width="xl" gutters>
        <Box paddingBlock="20 16">
          <VStack gap="16">
            <VStack gap="8" align="start">
              <div>
                <Heading size="large" spacing>
                  {translate(TEXTS.statiske.error.formNotFound.title)}
                </Heading>
                <BodyShort>{translate(TEXTS.statiske.error.formNotFound.message)}</BodyShort>
              </div>
              <Button as="a" href={url || PATHS.BASE_URL(locale)}>
                {translate(TEXTS.statiske.error.startNewForm)}
              </Button>
              <Link href={PATHS.MY_PAGE(locale)}>
                {stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}
              </Link>
            </VStack>
          </VStack>
        </Box>
      </Page.Block>
    </Page>
  );
}
