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
  showAnnet?: boolean;
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
      showAnnet,
    },
    ref,
  ) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { appConfig } = useComponentUtils();
    const data = dataFetcherData?.data;
    const fetchError = dataFetcherData?.fetchError;
    const isPreviewMode = appConfig.app === 'bygger';
    const isFyllut = appConfig.app === 'fyllut';
    const additionalData: Activity[] = [{ label: 'Annet', value: 'annet', type: 'ANNET' }];

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        const result = await getActivities(appConfig, queryParams);
        if (result) {
          setShowAdditionalDescription(result.length > 0);
          setMetadata({ data: [...result, ...(showAnnet ? additionalData : [])] });
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setShowAdditionalDescription(false);
        setMetadata({ fetchError: true });
      } finally {
        setLoading(false);
        setDone(true);
      }
    }, [additionalData, appConfig, queryParams, setMetadata, setShowAdditionalDescription, showAnnet]);

    useEffect(() => {
      if (isPreviewMode && !data) {
        setShowAdditionalDescription(previewData.length > 0);
        setMetadata({
          data: [...previewData, ...(showAnnet ? additionalData : [])],
        });
      } else if (isFyllut && !done && !data && !fetchError && !loading) {
        fetchData();
      }
    }, [
      appConfig,
      isPreviewMode,
      fetchData,
      fetchError,
      setMetadata,
      data,
      loading,
      isFyllut,
      done,
      setShowAdditionalDescription,
      showAnnet,
      additionalData,
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
