import { VStack } from '@navikt/ds-react';
import { dateUtils, Form, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useNavigationType } from 'react-router';
import { useFormDefinitionSubmissionMethod } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { useIntegration } from '../context/integration/IntegrationContext';
import FormHeader from '../layout/FormHeader';
import ReceiptActions from './ReceiptActions';
import ReceiptAlert from './ReceiptAlert';
import styles from './ReceiptPage.module.css';
import ReceiptPendingDocuments from './ReceiptPendingDocuments';
import ReceiptReceivedDocuments from './ReceiptReceivedDocuments';

interface Props {
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  receipt?: ReceiptSummary;
  pdf?: Blob;
}

const ReceiptPage = ({ form, receipt, pdf }: Props) => {
  const { logEvent } = useIntegration();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { currentLanguage, translate } = useLanguage();
  const { status } = useFormActions();
  const navigationType = useNavigationType();

  const soknadPdfUrl = useMemo(() => {
    if (!pdf) {
      return undefined;
    }

    return URL.createObjectURL(pdf);
  }, [pdf]);

  useEffect(() => {
    return () => {
      if (soknadPdfUrl) {
        URL.revokeObjectURL(soknadPdfUrl);
      }
    };
  }, [soknadPdfUrl]);

  const logDownloadPdf = () => {
    logEvent?.({
      name: 'last ned',
      data: {
        type: 'soknad',
        tema: form.properties.tema,
        tittel: translate(form.title),
        skjemaId: form.skjemanummer,
        submissionMethod,
        language: currentLanguage,
      },
    });
  };

  if (!receipt || (status === 'submitted' && navigationType === 'POP')) {
    return (
      <>
        <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
        <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>
      </>
    );
  }

  const allRequiredDocumentsSubmitted =
    receipt.attachmentsToSendLater.length === 0 && receipt.attachmentsToBeSentByOthers.length === 0;

  return (
    <>
      <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
      <VStack gap="space-32" className={styles.root}>
        {allRequiredDocumentsSubmitted && (
          <ReceiptAlert variant="success" heading={translate(TEXTS.statiske.receipt.alertSuccessHeading)}>
            {translate(TEXTS.statiske.receipt.alertSuccessBody)}
          </ReceiptAlert>
        )}

        <ReceiptReceivedDocuments receipt={receipt} pdfUrl={soknadPdfUrl} onDownload={logDownloadPdf} />
        <ReceiptPendingDocuments
          heading={translate(TEXTS.statiske.receipt.mustSendLaterHeading)}
          attachments={receipt.attachmentsToSendLater}
        />
        <ReceiptPendingDocuments
          heading={translate(TEXTS.statiske.receipt.sentByOthersHeading)}
          attachments={receipt.attachmentsToBeSentByOthers}
        />

        {!allRequiredDocumentsSubmitted && (
          <ReceiptAlert
            variant="warning"
            heading={
              <b>
                {translate(TEXTS.statiske.receipt.deadlineWarningHeading, {
                  deadline: dateUtils.toLocaleDate(receipt.sendLaterDeadline),
                })}
              </b>
            }
          >
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(translate(TEXTS.statiske.receipt.deadlineWarningBody)),
              }}
            />
          </ReceiptAlert>
        )}

        <ReceiptActions />
      </VStack>
    </>
  );
};

export default ReceiptPage;
