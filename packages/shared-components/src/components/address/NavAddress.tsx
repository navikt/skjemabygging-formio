import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import http from '../../api/util/http/http';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

type Props = {
  updateValue: (value: any) => void;
};

const NavAddress = ({ updateValue }: Props) => {
  const { appConfig } = useComponentUtils();

  const submissionMethod = appConfig?.submissionMethod;
  const isLoggedIn = appConfig?.config?.isLoggedIn;
  const app = appConfig?.app;

  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn && submissionMethod === 'digital') {
        const response = await http?.get<PrefillData>(
          `${appConfig?.baseUrl}/api/send-inn/prefill-data?properties=sokerAdresser`,
        );
        updateValue(response);
      }
    };

    fetchData();
  }, [app, appConfig?.baseUrl, isLoggedIn, submissionMethod, updateValue]);

  return null;
};

export default NavAddress;
