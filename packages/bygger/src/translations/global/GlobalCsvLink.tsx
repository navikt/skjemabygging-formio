import { GlobalTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { getAllPredefinedOriginalTexts, transformGlobalTranslationsToCsvData } from './utils';

interface Props {
  allGlobalTranslations: GlobalTranslationMap;
  languageCode: string;
}

interface CsvData {
  text: string;
  [key: string]: string | undefined;
}

interface CsvHeader {
  label: string;
  key: string;
}

const GlobalCsvLink = ({ allGlobalTranslations, languageCode }: Props) => {
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<CsvHeader[]>([]);

  useEffect(() => {
    const allPredefinedOriginalTexts = getAllPredefinedOriginalTexts(true);
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
      className="navds-button navds-button--secondary navds-button--small navds-label navds-label--small"
      separator=";"
      enclosingCharacter='"'
    >
      Eksporter
    </CSVLink>
  );
};

export default GlobalCsvLink;
