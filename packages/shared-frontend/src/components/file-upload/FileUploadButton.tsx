import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload } from '@navikt/ds-react';

interface Props {
  id: string;
  label: string;
  loading: boolean;
  variant: 'primary' | 'secondary';
  accept: string;
  maxSizeInBytes: number;
  onSelect: (files: FileObject[]) => void;
  onBlockedClick?: () => void;
}

const FileUploadButton = ({ id, label, loading, variant, accept, maxSizeInBytes, onSelect, onBlockedClick }: Props) => {
  const button = (
    <Button
      id={id}
      variant={variant}
      loading={loading}
      icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
      onClick={onBlockedClick}
    >
      {label}
    </Button>
  );

  return onBlockedClick ? (
    button
  ) : (
    <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxSizeInBytes} multiple={false}>
      {button}
    </FileUpload.Trigger>
  );
};

export default FileUploadButton;
export type { Props as FileUploadButtonProps };
