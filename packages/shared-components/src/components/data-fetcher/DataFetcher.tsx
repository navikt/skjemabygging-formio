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
  error?: ReactNode;
  setMetadata: (data: DataFetcherData) => void;
  dataFetcherData?: DataFetcherData;
}

const DataFetcher = forwardRef<HTMLFieldSetElement, Props>(
  ({ label, value, description, className, onChange, error, dataFetcherData, setMetadata }, ref) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { appConfig } = useComponentUtils();
    const data = dataFetcherData?.data;
    const fetchError = dataFetcherData?.fetchError;
    const isPreviewMode = appConfig.app === 'bygger';

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        const result = await getActivities(appConfig);
        if (result) {
          setMetadata({ data: result });
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setMetadata({ fetchError: true });
      } finally {
        setLoading(false);
        setDone(true);
      }
    }, [appConfig]);

    useEffect(() => {
      if (isPreviewMode) {
        setMetadata({ data: previewData });
      } else if (appConfig.app === 'fyllut' && !data && !loading) {
        fetchData();
      }
    }, [appConfig, isPreviewMode, fetchData, fetchError, setMetadata, data, loading]);

    if (loading) {
      return <SkeletonList size={3} height={'4rem'} />;
    }

    if (!data) {
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
