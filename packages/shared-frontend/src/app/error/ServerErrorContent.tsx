import { BodyShort, Box, Heading, Link, List } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { navUrls } from './navUrls';
import { ErrorContentProps, ErrorHeadingProps } from './types';

interface Props extends ErrorContentProps, ErrorHeadingProps {
  correlationId?: string;
}

const statusCode = '500';

const ServerErrorContent = ({ translate, locale, correlationId, headingRef }: Props) => (
  <>
    <div>
      <BodyShort size="small" textColor="subtle">
        {`${translate(TEXTS.statiske.error.statusCode)} ${statusCode}`}
      </BodyShort>
      <Heading ref={headingRef} tabIndex={headingRef ? -1 : undefined} size="large" spacing>
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
            <Link href={navUrls.BASE_URL(locale)}>{translate(TEXTS.statiske.error.goToFrontPage).toLowerCase()}</Link>
          </List.Item>
        </List>
      </Box>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(TEXTS.statiske.error.contactUs)) }} />
    </div>
    {correlationId && (
      <BodyShort size="small" textColor="subtle">
        {`${translate(TEXTS.statiske.error.errorId)}: ${correlationId}`}
      </BodyShort>
    )}
  </>
);

export { ServerErrorContent };
