import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { getActivities } from '../../api/register-data/activities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../formio/components/utils';
import { SkeletonList } from '../../index';

interface Props {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
  error?: ReactNode;
}

const DataFetcher = forwardRef<HTMLFieldSetElement, Props>(
  ({ label, value, description, className, onChange, error }, ref) => {
    const [data, setData] = useState<Activity[]>();
    const [loading, setLoading] = useState(false);
    const { appConfig } = useComponentUtils();

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await getActivities(appConfig);
          if (result) {
            setData(result);
          }
        } catch (ex) {
          console.error(ex);
        } finally {
          setLoading(false);
        }
      };
      if (appConfig.app === 'fyllut' && !data && !loading) {
        fetchData();
      }
    }, [appConfig]);

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
