import { FilePdfIcon, TrashIcon, UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload, Table } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useStaticPdf } from './StaticPdfContext';

interface Props {
  language: string;
  languageCode: string;
}

const StaticPdfTableRow = ({ language, languageCode }: Props) => {
  const { loading, getFile, uploadFile, deleteFile } = useStaticPdf();
  const file = getFile(languageCode);

  const handleUpload = async (files: FileObject[]) => {
    const fileObject = files?.[0];
    if (!fileObject || !languageCode) {
      return;
    }

    await uploadFile(languageCode, fileObject.file);
  };

  const handleDelete = async () => {
    await deleteFile(languageCode);
  };

  return (
    <Table.Row key={language} shadeOnHover={true}>
      <Table.DataCell>{language}</Table.DataCell>
      <Table.DataCell>{file?.fileName}</Table.DataCell>
      <Table.DataCell>{file?.createdAt ? dateUtils.toLocaleDateAndTime(file?.createdAt) : ''}</Table.DataCell>
      <Table.DataCell align="right">
        <FileUpload.Trigger multiple={false} onSelect={handleUpload}>
          <Button icon={<UploadIcon aria-hidden />} size="small" variant="tertiary-neutral" loading={loading} />
        </FileUpload.Trigger>
        {file && (
          <>
            <Button icon={<FilePdfIcon aria-hidden />} size="small" variant="tertiary-neutral" />
            <Button
              icon={<TrashIcon aria-hidden />}
              size="small"
              variant="tertiary-neutral"
              loading={loading}
              onClick={handleDelete}
            />
          </>
        )}
      </Table.DataCell>
    </Table.Row>
  );
};

export default StaticPdfTableRow;
