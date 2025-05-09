import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Activity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';
import { getActivities } from '../../api/register-data/activities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../formio/components/utils';
import { SkeletonList } from '../../index';
import previewData from './preview-data.json';
import { DataFetcherData } from './types';

interface Props {
  label: ReactNode;
  description?: ReactNode;
  additionalDescription?: ReactNode;
  className?: string;
  value?: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
  queryParams?: Record<string, string>;
  error?: ReactNode;
  setMetadata: (data: DataFetcherData) => void;
  dataFetcherData?: DataFetcherData;
  showOther?: boolean;
}

const otherData = [
  {
    label: TEXTS.statiske.dataFetcher.other,
    value: TEXTS.statiske.dataFetcher.other.toLowerCase(),
  },
];

const DataFetcher = forwardRef<HTMLFieldSetElement, Props>(
  (
    {
      label,
      value,
      description,
      additionalDescription,
      className,
      onChange,
      queryParams,
      error,
      dataFetcherData,
      setMetadata,
      showOther,
    },
    ref,
  ) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { appConfig } = useComponentUtils();
    const data = dataFetcherData?.data;
    const fetchError = dataFetcherData?.fetchError;
    const fetchDisabled = dataFetcherData?.fetchDisabled;
    const isBygger = appConfig.app === 'bygger';
    const isFyllut = appConfig.app === 'fyllut';
    const isSubmissionMethodDigital = appConfig.submissionMethod === 'digital';

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        const result = await getActivities(appConfig, queryParams);
        if (result) {
          setMetadata({ data: [...result, ...(showOther && result.length ? (otherData as Activity[]) : [])] });
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setMetadata({ fetchError: true });
      } finally {
        setLoading(false);
        setDone(true);
      }
    }, [appConfig, queryParams, setMetadata, showOther]);

    useEffect(() => {
      if (isBygger) {
        if (!data) {
          setMetadata({ data: [...previewData, ...(showOther ? (otherData as Activity[]) : [])] });
        }
      } else if (isFyllut) {
        if (isSubmissionMethodDigital) {
          if (!done && !data && !fetchError && !loading) {
            fetchData();
          }
        } else if (!fetchDisabled) {
          setMetadata({ fetchDisabled: true });
        }
      }
    }, [
      appConfig,
      isBygger,
      fetchData,
      fetchError,
      fetchDisabled,
      isSubmissionMethodDigital,
      setMetadata,
      data,
      loading,
      isFyllut,
      done,
      showOther,
    ]);

    if (loading) {
      return <SkeletonList size={3} height={'4rem'} />;
    }

    if (!data || !data.length) {
      return <></>;
    }

    return (
      <>
        <CheckboxGroup
          legend={label}
          description={description}
          value={getSelectedValuesAsList(value)}
          onChange={(values) => onChange(getSelectedValuesMap(data, values))}
          ref={ref}
          className={className}
          error={error}
          tabIndex={-1}
        >
          {data.map(({ value, label }) => (
            <Checkbox key={value} value={value}>
              {label}
            </Checkbox>
          ))}
        </CheckboxGroup>
        {additionalDescription}
      </>
    );
  },
);
export default DataFetcher;
