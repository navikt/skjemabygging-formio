import { Table } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import DeleteStaticPdfButton from '../../../../shared-components/src/pages/static-pdf/components/buttons/DeleteStaticPdfButton';
import DownloadStaticPdfButton from '../../../../shared-components/src/pages/static-pdf/components/buttons/DownloadStaticPdfButton';
import UploadStaticPdfButton from '../../../../shared-components/src/pages/static-pdf/components/buttons/UploadStaticPdfButton';
import { useStaticPdf } from '../../../../shared-components/src/pages/static-pdf/StaticPdfContext';

interface Props {
  language: string;
  languageCode: string;
}

const StaticPdfTableRow = ({ language, languageCode }: Props) => {
  const { getFile } = useStaticPdf();

  const file = useMemo(() => getFile(languageCode), [getFile, languageCode]);

  return (
    <Table.Row key={languageCode} shadeOnHover={true}>
      <Table.DataCell>{language}</Table.DataCell>
      <Table.DataCell>{file?.fileName}</Table.DataCell>
      <Table.DataCell>{file?.createdAt ? dateUtils.toLocaleDateAndTime(file?.createdAt) : ''}</Table.DataCell>
      <Table.DataCell align="right">
        <UploadStaticPdfButton language={language} languageCode={languageCode} replace={!!file} />
        {file && (
          <>
            <DownloadStaticPdfButton languageCode={languageCode} />
            <DeleteStaticPdfButton language={language} languageCode={languageCode} />
          </>
        )}
      </Table.DataCell>
    </Table.Row>
  );
};

export default StaticPdfTableRow;
