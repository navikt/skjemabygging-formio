import { GlobalTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactElement, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { getAllPredefinedOriginalTexts, transformGlobalTranslationsToCsvData } from './utils';

interface Props {
  allGlobalTranslations: GlobalTranslationMap;
  languageCode: string;
  children?: ReactElement | string;
}

interface CsvData {
  text: string;
  [key: string]: string | undefined;
}

interface CsvHeader {
  label: string;
  key: string;
}

const GlobalCsvLink = ({ allGlobalTranslations, languageCode, children }: Props) => {
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<CsvHeader[]>([]);

  useEffect(() => {
    const allPredefinedOriginalTexts = getAllPredefinedOriginalTexts();
    const { data, headers } = transformGlobalTranslationsToCsvData(
      allGlobalTranslations,
      allPredefinedOriginalTexts,
      languageCode,
    );
    setCsvData(data);
    setCsvHeaders(headers);
  }, [allGlobalTranslations, languageCode]);

  return (
    <CSVLink
      data={csvData}
      headers={csvHeaders}
      filename={`globale-oversettelser-${languageCode}.csv`}
      className="navds-button navds-button--tertiary navds-button--small navds-label navds-label--small"
      separator=";"
      enclosingCharacter='"'
    >
      {children ? children : 'Eksporter'}
    </CSVLink>
  );
};

export default GlobalCsvLink;
