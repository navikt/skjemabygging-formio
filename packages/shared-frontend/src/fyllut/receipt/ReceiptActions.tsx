import { PrinterSmallIcon } from '@navikt/aksel-icons';
import { Button, HStack } from '@navikt/ds-react';
import { stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinitionSubmissionMethod } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { getMyPageUrl } from '../navigation/navUrls';
import styles from './ReceiptPage.module.css';

const ReceiptActions = () => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate } = useLanguage();

  return (
    <HStack gap="space-16" className={styles.hideOnPrint}>
      {submissionMethod === 'digital' && (
        <Button role="link" as="a" href={translate(getMyPageUrl(window.location.href))} variant="secondary">
          {stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}
        </Button>
      )}
      <Button type="button" onClick={() => window.print()} variant="tertiary" icon={<PrinterSmallIcon aria-hidden />}>
        {translate(TEXTS.statiske.receipt.printFriendlyVersion)}
      </Button>
    </HStack>
  );
};

export default ReceiptActions;
