import { BodyShort, Box, HGrid, Heading, Link, Page, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function InternalServerError() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [correlationId, setCorrelationId] = useState<string>('');

  useEffect(() => {
    const correlationId = searchParams.get('correlationId');
    if (correlationId) {
      setCorrelationId(correlationId);
      searchParams.delete('correlationId');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <Page>
      <Page.Block as="main" width="xl" gutters>
        <Box paddingBlock="20 8">
          <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
            <VStack gap="16">
              <VStack gap="12" align="start">
                <div>
                  <BodyShort textColor="subtle" size="small">
                    Statuskode 500
                  </BodyShort>
                  <Heading level="1" size="large" spacing>
                    Beklager, noe gikk galt.
                  </Heading>
                  <BodyShort spacing>
                    En teknisk feil på våre servere gjør at siden er utilgjengelig. Dette skyldes ikke noe du gjorde.
                  </BodyShort>
                  <BodyShort>
                    Hvis problemet vedvarer, kan du{' '}
                    <Link href="https://nav.no/kontaktoss" target="_blank">
                      kontakte oss (åpnes i ny fane)
                    </Link>
                    .
                  </BodyShort>
                </div>
                {correlationId && (
                  <BodyShort size="small" textColor="subtle">
                    Feil-id: {correlationId}
                  </BodyShort>
                )}
              </VStack>

              <div>
                <Heading level="1" size="large" spacing>
                  Something went wrong
                </Heading>
                <BodyShort spacing>This was caused by a technical fault on our servers.</BodyShort>
                <BodyShort>
                  <Link target="_blank" href="https://www.nav.no/kontaktoss/en">
                    Contact us (opens in new tab)
                  </Link>{' '}
                  if the problem persists.
                </BodyShort>
              </div>
            </VStack>
          </HGrid>
        </Box>
      </Page.Block>
    </Page>
  );
}

export default InternalServerError;
