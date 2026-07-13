import { DataFetcherComponent, DataFetcherData, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo } from 'react';
import DataFetcher from '../../../components/data-fetcher/DataFetcher';
import { fetchRegisterData, getDataFetcherData } from '../../../components/data-fetcher/dataFetcherUtils';
import { useAppConfig } from '../../../context/app-config/AppConfigContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { parseSubmissionPath, setDeepValue } from '../../../context/state/stateHelpers';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputDataFetcher = ({ component, submissionPath }: InputComponentProps) => {
  type SubmissionMetadata = NonNullable<Submission['metadata']>;
  const dataFetcherComponent = component as DataFetcherComponent;
  const { submissionMethod, logger } = useAppConfig();
  const { submission, setSubmission } = useSubmissionState();
  const statePath = resolveSubmissionPath(component, submissionPath);
  const dataFetcherData = getDataFetcherData(statePath, submission);
  const values = dataFetcherData?.data ?? [];
  const readMore = resolveReadMore(component);
  const otherOption = useMemo(
    () => ({
      label: TEXTS.statiske.dataFetcher.other,
      value: TEXTS.statiske.dataFetcher.other.toLowerCase(),
    }),
    [],
  );

  const updateMetadata = useCallback(
    (metadata: DataFetcherData) => {
      setSubmission((prev): Submission => {
        const previousMetadata = prev?.metadata as SubmissionMetadata | undefined;

        return {
          ...(prev ?? { data: {} }),
          metadata: {
            ...(previousMetadata ?? ({} as SubmissionMetadata)),
            dataFetcher: setDeepValue(
              previousMetadata?.dataFetcher ?? {},
              parseSubmissionPath(statePath),
              metadata,
            ) as SubmissionMetadata['dataFetcher'],
          } as SubmissionMetadata,
        };
      });
    },
    [setSubmission, statePath],
  );

  useEffect(() => {
    if (submissionMethod !== 'digital') {
      if (!dataFetcherData?.fetchDisabled) {
        updateMetadata({ fetchDisabled: true });
      }
      return;
    }

    if (dataFetcherData) {
      return;
    }

    let cancelled = false;

    void fetchRegisterData(dataFetcherComponent.dataFetcherSourceId || 'activities', dataFetcherComponent.queryParams)
      .then((result) => {
        if (cancelled) {
          return;
        }

        updateMetadata({
          data: [...result, ...(dataFetcherComponent.showOther && result.length > 0 ? [otherOption] : [])],
        });
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        logger?.error?.('Failed to load register data', {
          statePath,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        });
        updateMetadata({ fetchError: true });
      });

    return () => {
      cancelled = true;
    };
  }, [
    dataFetcherComponent.dataFetcherSourceId,
    dataFetcherComponent.queryParams,
    dataFetcherComponent.showOther,
    dataFetcherData,
    logger,
    otherOption,
    statePath,
    submissionMethod,
    updateMetadata,
  ]);

  if (submissionMethod !== 'digital' || values.length === 0) {
    return null;
  }

  return (
    <DataFetcher
      statePath={statePath}
      label={component.label ?? 'Datahenter'}
      description={component.description}
      readMore={readMore}
      values={values}
      required={component.validate?.required ?? false}
    />
  );
};

export default InputDataFetcher;
