import { Button } from '@navikt/ds-react';
import { ReactNode, useState } from 'react';
import { downloadBlob } from '../../utils/blob';

interface Props {
  fileName: string;
  isValid?: () => boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  children?: ReactNode;
  pdfContent: () => Promise<Blob | undefined>;
}

const DownloadPdfButton = ({ fileName, isValid, onClick, onSuccess, onError, children, pdfContent }: Props) => {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (downloading) {
      return;
    }

    onClick?.();
    if (isValid && !isValid()) {
      return;
    }

    setDownloading(true);
    try {
      const content = await pdfContent();
      if (content) {
        downloadBlob(content, fileName);
        onSuccess?.();
      }
    } catch {
      onError?.();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={download} loading={downloading} download as="a">
      {children}
    </Button>
  );
};

export default DownloadPdfButton;
