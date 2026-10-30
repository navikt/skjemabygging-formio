import { Button } from '@navikt/ds-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '../../utils/blob';

interface Props {
  fileName: string;
  isValid?: () => boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  disabled?: boolean;
  pendingLabel?: string;
  children?: ReactNode;
  pdfContent: () => Promise<Blob>;
}

const DownloadPdfButton = ({
  fileName,
  isValid,
  onClick,
  onSuccess,
  onError,
  disabled,
  pendingLabel,
  children,
  pdfContent,
}: Props) => {
  const [downloading, setDownloading] = useState(false);
  const pending = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (downloading || !restoreFocus.current) return;
    restoreFocus.current = false;
    const frame = requestAnimationFrame(() => {
      const button = buttonRef.current;
      // Disabling the button or opening the download can drop focus.
      if (button && button.ownerDocument.activeElement === button.ownerDocument.body) button.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [downloading]);

  const download = async () => {
    if (pending.current || disabled) {
      return;
    }

    onClick?.();
    if (isValid && !isValid()) {
      return;
    }

    pending.current = true;
    restoreFocus.current = buttonRef.current?.ownerDocument.activeElement === buttonRef.current;
    setDownloading(true);
    try {
      const content = await pdfContent();
      if (!content.size) throw new Error('Cannot download an empty PDF.');
      downloadBlob(content, fileName);
      onSuccess?.();
    } catch (error: unknown) {
      onError?.(error);
    } finally {
      pending.current = false;
      setDownloading(false);
    }
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={download}
        loading={downloading}
        disabled={disabled || downloading}
        aria-label={typeof children === 'string' ? children : undefined}
        type="button"
      >
        {children}
      </Button>
      {pendingLabel && <div role="status">{downloading ? pendingLabel : undefined}</div>}
    </>
  );
};

export default DownloadPdfButton;
