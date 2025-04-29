import { BugIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PATHS } from '../../util/paths';

export function NotFoundPage() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';

  return (
    <Page tabIndex={-1}>
      <Page.Block width="xl" gutters>
        <Box paddingBlock="20 16">
          <VStack gap="16">
            <VStack gap="12" align="start">
              <div>
                <Heading size="large" spacing>
                  {translate(TEXTS.statiske.error.notFoundTitle)}
                </Heading>
                <BodyShort>{translate(TEXTS.statiske.error.notFoundMessage)}</BodyShort>
                <List>
                  <List.Item>{translate(TEXTS.statiske.error.useSearch)}</List.Item>
                  <List.Item>
                    <Link href={PATHS.BASE_URL}>{translate(TEXTS.statiske.error.goToFrontPage)}</Link>
                  </List.Item>
                </List>
              </div>
              <Button as="a" href={PATHS.MY_PAGE}>
                {translate(TEXTS.statiske.error.goToMyPage)}
              </Button>
              <Link href={PATHS.REPORT_BUG(locale)}>
                <BugIcon aria-hidden />
                {translate(TEXTS.statiske.error.reportError)}
              </Link>
            </VStack>
          </VStack>
        </Box>
      </Page.Block>
    </Page>
  );
}
