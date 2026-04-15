import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { downloadBlob } from '../../util/blob/blob';

interface Props {
  fileName: string;
  isValid?: () => boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  className?: string;
  variant?: 'primary' | 'tertiary-neutral';
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  pdfContent: () => Promise<Blob | undefined>;
  dataTestId?: string;
}

const DownloadPdfButton = ({
  fileName,
  className,
  isValid,
  onClick,
  onSuccess,
  onError,
  icon,
  variant,
  size,
  children,
  pdfContent,
  dataTestId,
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
      const content = await pdfContent();

      if (content) {
        downloadBlob(content, fileName);

        if (onSuccess) {
          onSuccess();
        }
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
      icon={icon}
      className={className}
      variant={variant ?? 'primary'}
      onClick={clickDownload}
      loading={downloading}
      size={size ?? 'medium'}
      data-testid={dataTestId}
      download
      as="a"
    >
      {children}
    </Button>
  );
};

export default DownloadPdfButton;
