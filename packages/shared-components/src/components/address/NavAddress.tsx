import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import http from '../../api/util/http/http';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

type Props = {
  updateValue: (value: any) => void;
};

const NavAddress = ({ updateValue }: Props) => {
  const { translate, appConfig } = useComponentUtils();

  useEffect(() => {
    const fetchData = async () => {
      if (appConfig?.app === 'fyllut' && appConfig?.config?.isLoggedIn && appConfig?.submissionMethod === 'digital') {
        const response = await http?.get<PrefillData>(
          `${appConfig?.baseUrl}/api/send-inn/prefill-data?properties=sokerAdresser`,
        );
        console.log(response);
        updateValue(response);
      }
    };

    fetchData();
  }, [appConfig?.app, appConfig?.baseUrl, appConfig?.config?.isLoggedIn, appConfig?.submissionMethod, updateValue]);

  return null;
};

export default NavAddress;
