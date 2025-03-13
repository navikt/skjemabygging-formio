import React from 'react';
import { ButtonWithSpinner, http } from '../../index';

interface Props {
  fileName: string;
  values: Record<string, string | undefined>;
  actionUrl: string;
  isValid?: () => boolean;
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
  onSuccess,
  onError,
  children,
}: Props) => {
  const download = async () => {
    if (isValid && !isValid()) {
      return;
    }

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
    }
  };

  return (
    <ButtonWithSpinner onClick={download} className={className} download>
      {children}
    </ButtonWithSpinner>
  );
};

export default DownloadPdfButton;
