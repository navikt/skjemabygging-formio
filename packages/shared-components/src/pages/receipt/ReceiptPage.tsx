import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';

export function ReceiptPage() {
  const { form, setFormProgressVisible } = useForm();
  const { soknadPdfBlob } = useSendInn();

  useEffect(() => {
    setFormProgressVisible(false);
  }, [setFormProgressVisible]);

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : null;
  }, [soknadPdfBlob]);

  return (
    <div>
      {form && (
        <div>
          <p>Takk for at du sendte inn skjemaet.</p>
          {soknadPdfUrl && (
            <a href={soknadPdfUrl} download={`${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`}>
              Last ned kvittering (PDF)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
