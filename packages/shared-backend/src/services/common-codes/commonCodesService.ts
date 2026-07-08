import { Enhetstype, EnhetstypeNorg } from '@navikt/skjemadigitalisering-shared-domain';
import commonCodesClient from './commonCodesClient';
import type { BetydningEntry } from './types';

type CommonCodesClient = Pick<typeof commonCodesClient, 'getCodeDescriptions'>;

interface CommonCodeRequest {
  accessToken?: string;
}

interface LanguageAwareCommonCodeRequest extends CommonCodeRequest {
  languageCode: string;
}

interface CommonCodeOption {
  label: string;
  value: string;
}

type CommonCodesService = {
  getArchiveSubjects: (props: LanguageAwareCommonCodeRequest) => Promise<Record<string, string>>;
  getCurrencies: (props?: CommonCodeRequest) => Promise<CommonCodeOption[]>;
  getNavUnitTypes: (props: LanguageAwareCommonCodeRequest) => Promise<EnhetstypeNorg[]>;
  getAreaCodes: (props?: CommonCodeRequest) => Promise<CommonCodeOption[]>;
};

interface CreateCommonCodesServiceProps {
  baseUrl: string;
  consumerId: string;
  client?: CommonCodesClient;
}

const getTerm = (entries: BetydningEntry[] | undefined, languageCode: string, fallback: string) => {
  return entries?.[0]?.beskrivelser?.[languageCode]?.term ?? fallback;
};

const getOptionalTerm = (entries: BetydningEntry[] | undefined, languageCode: string) => {
  return entries?.[0]?.beskrivelser?.[languageCode]?.term;
};

const sortAsc = (list: CommonCodeOption[], languageCode: string) => {
  return list.sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase(), languageCode));
};

const createCommonCodesService = ({
  baseUrl,
  consumerId,
  client = commonCodesClient,
}: CreateCommonCodesServiceProps): CommonCodesService => {
  const getArchiveSubjects = async ({
    languageCode,
    accessToken,
  }: LanguageAwareCommonCodeRequest): Promise<Record<string, string>> => {
    const response = await client.getCodeDescriptions({
      baseUrl,
      commonCode: 'TemaIFyllUt',
      languageCode,
      consumerId,
      accessToken,
    });

    return Object.fromEntries(
      Object.entries(response.betydninger).map(([key, entries]) => [key, getTerm(entries, languageCode, key)]),
    );
  };

  const getCurrencies = async ({ accessToken }: CommonCodeRequest = {}): Promise<CommonCodeOption[]> => {
    const languageCode = 'nb';
    const response = await client.getCodeDescriptions({
      baseUrl,
      commonCode: 'ValutaBetaling',
      languageCode,
      consumerId,
      accessToken,
    });

    const mostUsedCurrencies: CommonCodeOption[] = [];
    const currencies: CommonCodeOption[] = [];

    for (const [key, entries] of Object.entries(response.betydninger)) {
      const option = { label: `${getOptionalTerm(entries, languageCode)} (${key})`, value: key };

      if (key === 'NOK' || key === 'EUR' || key === 'SEK') {
        mostUsedCurrencies.push(option);
      } else {
        currencies.push(option);
      }
    }

    sortAsc(mostUsedCurrencies, languageCode);
    sortAsc(currencies, languageCode);

    return mostUsedCurrencies.concat(currencies);
  };

  const getNavUnitTypes = async ({
    languageCode,
    accessToken,
  }: LanguageAwareCommonCodeRequest): Promise<EnhetstypeNorg[]> => {
    const response = await client.getCodeDescriptions({
      baseUrl,
      commonCode: 'EnhetstyperNorg',
      languageCode,
      consumerId,
      accessToken,
    });

    return Object.entries(response.betydninger).map(([key, entries]) => ({
      kodenavn: key as Enhetstype,
      term: getTerm(entries, languageCode, key),
    }));
  };

  const getAreaCodes = async ({ accessToken }: CommonCodeRequest = {}): Promise<CommonCodeOption[]> => {
    const languageCode = 'nb';
    const response = await client.getCodeDescriptions({
      baseUrl,
      commonCode: 'Retningsnumre',
      languageCode,
      consumerId,
      accessToken,
    });

    const areaCodes = Object.entries(response.betydninger).map(([key, entries]) => ({
      label: `${key} ${getOptionalTerm(entries, languageCode)}`,
      value: key,
    }));

    return sortAsc(areaCodes, languageCode);
  };

  return {
    getArchiveSubjects,
    getCurrencies,
    getNavUnitTypes,
    getAreaCodes,
  };
};

export { createCommonCodesService };
export type { CommonCodesService };
