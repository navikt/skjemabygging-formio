import { BodyShort, Heading } from '@navikt/ds-react';
import { dateUtils, NavFormType, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import InnerHtml from '../../components/inner-html/InnerHtml';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/styles/jss/jss';

interface Props {
  form: NavFormType;
  receipt: ReceiptSummary;
}

const printBodyClass = 'receipt-page-print-active';

const useStyles = makeStyles({
  '@global': {
    '@media print': {
      [`body.${printBodyClass} *`]: {
        visibility: 'hidden',
      },
      [`body.${printBodyClass} .receipt-page-print, body.${printBodyClass} .receipt-page-print *`]: {
        visibility: 'visible',
      },
      [`body.${printBodyClass} .receipt-page-print`]: {
        position: 'absolute',
        inset: 0,
        width: '100%',
      },
    },
  },
  root: {
    display: 'none',
    '@media print': {
      display: 'block',
      color: '#000',
      '& a': {
        color: '#000',
        textDecoration: 'none',
      },
    },
  },
  logo: {
    width: '68px',
    height: 'auto',
    marginBottom: 'var(--ax-space-40)',
  },
  title: {
    marginBottom: 'var(--ax-space-4)',
  },
  formNumber: {
    marginBottom: 'var(--ax-space-32)',
  },
  section: {
    marginBottom: 'var(--ax-space-24)',
  },
  sectionTitle: {
    marginBottom: 'var(--ax-space-8)',
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
  },
  listItem: {
    marginBottom: 'var(--ax-space-4)',
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

const ReceiptPagePrint = ({ form, receipt }: Props) => {
  const styles = useStyles();
  const { translate } = useLanguages();

  useEffect(() => {
    document.body.classList.add(printBodyClass);
    return () => {
      document.body.classList.remove(printBodyClass);
    };
  }, []);

  const allRequiredDocumentsSubmitted =
    receipt.attachmentsToSendLater.length === 0 && receipt.attachmentsToBeSentByOthers.length === 0;

  return (
    <div className={`receipt-page-print ${styles.root}`}>
      <svg className={styles.logo} viewBox="0 0 174 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M172.332 0.623047H154.344C154.344 0.623047 153.079 0.623057 152.627 1.60878L142.684 29.3733L132.741 1.60878C132.289 0.623057 131.023 0.623047 131.023 0.623047H96.4035C95.6804 0.623047 95.0476 1.19805 95.0476 1.8552V11.3017C95.0476 3.82664 86.2797 0.623047 81.2179 0.623047C69.7382 0.623047 62.055 7.5231 59.7049 17.9553C59.6145 11.0553 58.9817 8.50882 56.9027 6.04452C55.9988 4.81237 54.643 3.74451 53.1063 2.92308C50.033 1.28021 47.3213 0.705195 41.4459 0.705195H34.4858C34.4858 0.705195 33.2203 0.705205 32.7684 1.69093L26.441 15.9017V1.93735C26.441 1.2802 25.8083 0.705195 25.0852 0.705195H9.08602C9.08602 0.705195 7.82053 0.705205 7.36857 1.69093L0.860454 16.4768C0.860454 16.4768 0.227713 17.9553 1.67397 17.9553H7.82053V46.0484C7.82053 46.7877 8.45326 47.2805 9.17639 47.2805H25.0852C25.8083 47.2805 26.441 46.7055 26.441 46.0484V17.9553H32.678C36.2032 17.9553 37.0168 18.0375 38.3726 18.6125C39.1861 18.9411 39.9996 19.4339 40.3612 20.1732C41.1747 21.5696 41.4459 23.2947 41.4459 28.3876V46.0484C41.4459 46.7877 42.0786 47.2805 42.8018 47.2805H57.9874C57.9874 47.2805 59.7048 47.2806 60.3376 45.7198L63.6821 38.1626C68.2016 43.9127 75.5232 47.2805 84.7431 47.2805H86.7317C86.7317 47.2805 88.4491 47.2806 89.1722 45.7198L95.0476 32.4947V46.0484C95.0476 46.7877 95.6804 47.2805 96.4035 47.2805H111.951C111.951 47.2805 113.668 47.2806 114.391 45.7198C114.391 45.7198 120.628 31.6733 120.628 31.5911C120.899 30.4411 119.272 30.4411 119.272 30.4411H113.759V6.37309L131.204 45.7198C131.927 47.2806 133.554 47.2805 133.554 47.2805H151.903C151.903 47.2805 153.621 47.2806 154.344 45.7198L173.688 2.18379C174.32 0.70521 172.422 0.705195 172.422 0.705195L172.332 0.623047ZM94.9573 30.359H84.5623C80.4044 30.359 77.0599 27.3197 77.0599 23.5411C77.0599 19.7625 80.4044 16.7232 84.5623 16.7232H87.4548C91.6128 16.7232 94.9573 19.7625 94.9573 23.5411V30.359Z"
          fill="#000"
        />
      </svg>

      <Heading level="1" size="medium" className={styles.title}>
        {translate(TEXTS.statiske.receipt.title)}: {receipt.title}
      </Heading>
      <BodyShort className={styles.formNumber}>{form.properties.skjemanummer}</BodyShort>

      {allRequiredDocumentsSubmitted && (
        <section className={styles.section}>
          <Heading level="2" size="xsmall" className={styles.sectionTitle}>
            {translate(TEXTS.statiske.receipt.alertSuccessHeading)}
          </Heading>
          <BodyShort>{translate(TEXTS.statiske.receipt.alertSuccessBody)}</BodyShort>
        </section>
      )}

      <section className={styles.section}>
        <Heading level="2" size="xsmall" className={styles.sectionTitle}>
          {translate(TEXTS.statiske.receipt.documentsReceivedHeading, {
            date: dateUtils.toLocaleDate(receipt.receivedDate),
          })}
        </Heading>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <BodyShort>{receipt.title}</BodyShort>
          </li>
          {receipt.receivedAttachments.map((attachment) => (
            <li key={attachment.id} className={styles.listItem}>
              <BodyShort>{attachment.title}</BodyShort>
            </li>
          ))}
        </ul>
      </section>

      {receipt.attachmentsToSendLater.length > 0 && (
        <section className={styles.section}>
          <Heading level="2" size="xsmall" className={styles.sectionTitle}>
            {translate(TEXTS.statiske.receipt.mustSendLaterHeading)}
          </Heading>
          <ul className={styles.list}>
            {receipt.attachmentsToSendLater.map((attachment) => (
              <li key={attachment.id} className={styles.listItem}>
                <BodyShort>{attachment.title}</BodyShort>
              </li>
            ))}
          </ul>
        </section>
      )}

      {receipt.attachmentsToBeSentByOthers.length > 0 && (
        <section className={styles.section}>
          <Heading level="2" size="xsmall" className={styles.sectionTitle}>
            {translate(TEXTS.statiske.receipt.sentByOthersHeading)}
          </Heading>
          <ul className={styles.list}>
            {receipt.attachmentsToBeSentByOthers.map((attachment) => (
              <li key={attachment.id} className={styles.listItem}>
                <BodyShort>{attachment.title}</BodyShort>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!allRequiredDocumentsSubmitted && (
        <section className={styles.section}>
          <Heading level="2" size="xsmall" className={styles.sectionTitle}>
            {translate(TEXTS.statiske.receipt.deadlineWarningHeading, {
              deadline: dateUtils.toLocaleDate(receipt.sendLaterDeadline),
            })}
          </Heading>
          <InnerHtml content={translate(TEXTS.statiske.receipt.deadlineWarningBody)} />
        </section>
      )}
    </div>
  );
};

export default ReceiptPagePrint;
