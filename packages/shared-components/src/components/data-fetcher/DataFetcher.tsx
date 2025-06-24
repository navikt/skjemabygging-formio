import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import {
  DataFetcherData,
  DataFetcherElement,
  DataFetcherSourceId,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';
import { getRegisterData } from '../../api/register-data/registerDataApi';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../formio/components/utils';
import { SkeletonList } from '../../index';
import previewData from './preview-data.json';

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
  dataFetcherSourceId: DataFetcherSourceId;
}

const otherOption: DataFetcherElement = {
  label: TEXTS.statiske.dataFetcher.other,
  value: TEXTS.statiske.dataFetcher.other.toLowerCase(),
};

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
      dataFetcherSourceId,
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
        const result = await getRegisterData<DataFetcherElement[]>(dataFetcherSourceId, appConfig, queryParams);
        if (result) {
          setMetadata({ data: [...result, ...(showOther && result.length ? [otherOption] : [])] });
        }
      } catch (error) {
        console.error('Failed to fetch register data:', error);
        setMetadata({ fetchError: true });
      } finally {
        setLoading(false);
        setDone(true);
      }
    }, [appConfig, queryParams, setMetadata, showOther, dataFetcherSourceId]);

    useEffect(() => {
      if (isBygger) {
        if (!data) {
          setMetadata({ data: [...previewData, ...(showOther ? [otherOption] : [])] });
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
