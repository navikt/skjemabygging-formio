import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { http } from '../../index';

interface Props {
  fileName: string;
  values: Record<string, string | undefined>;
  actionUrl: string;
  isValid?: () => boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DownloadPdfButton = ({
  fileName,
  values,
  actionUrl,
  className,
  isValid,
  onClick,
  onSuccess,
  onError,
  children,
}: Props) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  const clickDownload = async () => {
    if ((isValid && !isValid()) || downloading) {
      return;
    }

    if (onClick) {
      onClick();
    }
    setDownloading(true);

    try {
      const response: Blob = await http.post(actionUrl, values, {
        Accept: http.MimeType.PDF,
      });
      const url = window.URL.createObjectURL(response);
      if (!url) {
        throw new Error('Could not create PDF url');
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();

      if (onSuccess) {
        onSuccess();
      }
    } catch (_error) {
      if (onError) {
        onError();
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      className={className}
      variant="primary"
      onClick={clickDownload}
      loading={downloading}
      size="medium"
      download
      as="a"
    >
      {children}
    </Button>
  );
};

export default DownloadPdfButton;
