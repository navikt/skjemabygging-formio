import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';
import { getActivities } from '../../api/register-data/activities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../formio/components/utils';
import { SkeletonList } from '../../index';
import previewData from './preview-data.json';

type DataFetcherData = {
  data?: Activity[];
  fetchError?: boolean;
  fetchDisabled?: boolean;
};

interface Props {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
  queryParams?: Record<string, string>;
  error?: ReactNode;
  setMetadata: (data: DataFetcherData) => void;
  setShowAdditionalDescription: (value: boolean) => void;
  dataFetcherData?: DataFetcherData;
}

const DataFetcher = forwardRef<HTMLFieldSetElement, Props>(
  (
    {
      label,
      value,
      description,
      className,
      onChange,
      queryParams,
      error,
      dataFetcherData,
      setMetadata,
      setShowAdditionalDescription,
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
    const submissionMethodIsDigital = appConfig.submissionMethod === 'digital';

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        const result = await getActivities(appConfig, queryParams);
        if (result) {
          setShowAdditionalDescription(result.length > 0);
          setMetadata({ data: result });
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setShowAdditionalDescription(false);
        setMetadata({ fetchError: true });
      } finally {
        setLoading(false);
        setDone(true);
      }
    }, [appConfig, queryParams, setMetadata, setShowAdditionalDescription]);

    useEffect(() => {
      if (isBygger) {
        if (!data) {
          setShowAdditionalDescription(previewData.length > 0);
          setMetadata({ data: previewData });
        }
      } else if (isFyllut) {
        if (submissionMethodIsDigital) {
          if (!done && !data && !fetchError && !loading) {
            fetchData();
          }
        } else if (!fetchDisabled) {
          setShowAdditionalDescription(false);
          setMetadata({ fetchDisabled: true });
        }
      }
    }, [
      appConfig,
      isBygger,
      fetchData,
      fetchError,
      fetchDisabled,
      submissionMethodIsDigital,
      setMetadata,
      data,
      loading,
      isFyllut,
      done,
      setShowAdditionalDescription,
    ]);

    if (loading) {
      return <SkeletonList size={3} height={'4rem'} />;
    }

    if (!data || !data.length) {
      return <></>;
    }

    return (
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
    );
  },
);
export default DataFetcher;
