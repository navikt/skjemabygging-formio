import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { getActivities } from '../../api/register-data/activities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { SkeletonList } from '../../index';

interface Props {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: string[];
  onChange: (value: any) => void;
  error?: ReactNode;
}

type Activities = { label: string; value: string; description?: string };
type RegisterData = Activities;

const ReactKomponenten = forwardRef<HTMLFieldSetElement, Props>(
  ({ label, value, description, className, onChange, error }, ref) => {
    const [data, setData] = useState<RegisterData[]>();
    const [loading, setLoading] = useState(false);
    const { translate, appConfig } = useComponentUtils();

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
        defaultValue={value}
        onChange={onChange}
        ref={ref}
        className={className}
        error={error}
      >
        {data.map((obj) => (
          <Checkbox key={obj.value} value={obj.value} description={obj?.description}>
            {translate(obj.label)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    );
  },
);

export default ReactKomponenten;
