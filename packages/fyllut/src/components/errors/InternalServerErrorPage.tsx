import { BodyShort, Box, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import { InnerHtml, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PATHS } from '../../util/paths';

export function InternalServerErrorPage() {
  const { translate } = useLanguages();
  const [searchParams, setSearchParams] = useSearchParams();
  const [correlationId, setCorrelationId] = useState<string | undefined>();
  const statusCode = '500';

  useEffect(() => {
    const correlationId = searchParams.get('correlationId');
    if (correlationId) {
      setCorrelationId(correlationId);
      searchParams.delete('correlationId');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <Page tabIndex={-1}>
      <Page.Block width="xl" gutters>
        <Box paddingBlock="20 8">
          <VStack gap="16">
            <VStack gap="12" align="start">
              <div>
                <BodyShort size="small" textColor="subtle">
                  {`${translate(TEXTS.statiske.error.statusCode)} ${statusCode}`}
                </BodyShort>
                <Heading size="large" spacing>
                  {translate(TEXTS.statiske.error.serverErrorTitle)}
                </Heading>
                <BodyShort spacing>{translate(TEXTS.statiske.error.serverErrorMessage)}</BodyShort>
                <BodyShort spacing>{translate(TEXTS.statiske.error.suggestions)}</BodyShort>
                <List>
                  <List.Item>
                    {`${translate(TEXTS.statiske.error.wait)} `}
                    <Link onClick={() => location.reload()}>{translate(TEXTS.statiske.error.reloadPage)}</Link>
                  </List.Item>
                  {window.history.length > 1 && (
                    <List.Item>
                      <Link onClick={() => history.back()}>{translate(TEXTS.statiske.error.goBack)}</Link>
                    </List.Item>
                  )}
                </List>
                <InnerHtml content={translate(TEXTS.statiske.error.contactUs)} />
              </div>

              {correlationId && (
                <BodyShort size="small" textColor="subtle">
                  {`${translate(TEXTS.statiske.error.errorId)}: ${correlationId}`}
                </BodyShort>
              )}
              <Button as="a" href={PATHS.MY_PAGE}>
                {translate(TEXTS.statiske.error.goToMyPage)}
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Page.Block>
    </Page>
  );
}
