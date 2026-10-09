import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { ServerErrorContent } from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

export function InternalServerErrorContent() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';
  const [searchParams, setSearchParams] = useSearchParams();
  const [correlationId, setCorrelationId] = useState<string | undefined>();

  useEffect(() => {
    const correlationId = searchParams.get('correlationId');
    if (correlationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- state is intentionally hydrated from URL params on mount/update.
      setCorrelationId(correlationId);
      searchParams.delete('correlationId');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return <ServerErrorContent translate={translate} locale={locale} correlationId={correlationId} />;
}
