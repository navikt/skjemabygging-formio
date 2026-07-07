import correlator from 'express-correlation-id';
import http from '../../shared/http/http';
import type { CodeDescriptionsResponse, CommonCodeName } from './types';

interface GetCodeDescriptionsProps {
  baseUrl: string;
  commonCode: CommonCodeName;
  languageCode: string;
  consumerId: string;
  accessToken?: string;
}

const getCodeDescriptions = async ({
  baseUrl,
  commonCode,
  languageCode,
  consumerId,
  accessToken,
}: GetCodeDescriptionsProps): Promise<CodeDescriptionsResponse> => {
  const searchParams = new URLSearchParams({
    ekskluderUgyldige: 'true',
    spraak: languageCode,
  });

  return await http.get<CodeDescriptionsResponse>(
    `${baseUrl}/api/v1/kodeverk/${commonCode}/koder/betydninger?${searchParams.toString()}`,
    {
      headers: {
        'Nav-Call-Id': correlator.getId() ?? '',
        'Nav-Consumer-Id': consumerId,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    },
  );
};

const commonCodesClient = {
  getCodeDescriptions,
};

export default commonCodesClient;
