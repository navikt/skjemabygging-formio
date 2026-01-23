import { BodyShort, Box, Heading, Link, List } from '@navikt/ds-react';
import { InnerHtml, useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PATHS } from '../../../util/paths';

export function InternalServerErrorContent() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';
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
    <>
      <div>
        <BodyShort size="small" textColor="subtle">
          {`${translate(TEXTS.statiske.error.statusCode)} ${statusCode}`}
        </BodyShort>
        <Heading size="large" spacing>
          {translate(TEXTS.statiske.error.serverErrorTitle)}
        </Heading>
        <BodyShort spacing>{translate(TEXTS.statiske.error.serverErrorMessage)}</BodyShort>
        <BodyShort spacing>{translate(TEXTS.statiske.error.suggestions)}</BodyShort>
        <Box marginBlock="space-16" asChild>
          <List data-aksel-migrated-v8>
            <List.Item>
              {`${translate(TEXTS.statiske.error.wait)} `}
              <Link onClick={() => location.reload()}>{translate(TEXTS.statiske.error.reloadPage)}</Link>
            </List.Item>
            {window.history.length > 1 && (
              <List.Item>
                <Link onClick={() => history.back()}>{translate(TEXTS.statiske.error.goBack)}</Link>
              </List.Item>
            )}
            <List.Item>
              <Link href={PATHS.BASE_URL(locale)}>{translate(TEXTS.statiske.error.goToFrontPage).toLowerCase()}</Link>
            </List.Item>
          </List>
        </Box>
        <InnerHtml content={translate(TEXTS.statiske.error.contactUs)} />
      </div>
      {correlationId && (
        <BodyShort size="small" textColor="subtle">
          {`${translate(TEXTS.statiske.error.errorId)}: ${correlationId}`}
        </BodyShort>
      )}
    </>
  );
}
