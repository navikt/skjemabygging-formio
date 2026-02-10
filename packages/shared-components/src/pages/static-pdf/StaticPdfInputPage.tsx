import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FormCountrySelect from './components/shared/address/FormCountrySelect';
import FormPostalCode from './components/shared/address/FormPostalCode';
import FormPostalName from './components/shared/address/FormPostalName';
import FormStreetAddress from './components/shared/address/FormStreetAddress';
import FormBox from './components/shared/FormBox';
import FormNavUnitSelect from './components/shared/FormNavUnitSelect';
import FormTextField from './components/shared/FormTextField';
import FormFirstName from './components/shared/identity/FormFirstName';
import FormSurname from './components/shared/identity/FormSurname';
import SelectAttachmentList from './components/shared/SelectAttachmentList';
import StaticPdfIdentityType from './components/shared/StaticPdfIdentityType';

const StaticPdfInputPage = () => {
  const { form, setSubmission, submission } = useForm();
  const { enhetMaVelgesVedPapirInnsending } = form.properties;
  const { currentLanguage } = useLanguages();

  useEffect(() => {
    if (!submission) {
      setSubmission({
        data: {
          identityType: 'identityNumber',
          coverPage: {
            languageCode: currentLanguage,
          },
        },
      });
    }
  }, [setSubmission, submission, currentLanguage]);

  return (
    <>
      <FormBox bottom="space-32">
        {enhetMaVelgesVedPapirInnsending ? (
          <FormNavUnitSelect submissionPath="coverPage.recipient.navUnit" />
        ) : (
          <div>
            <StaticPdfIdentityType submissionPath="identityType" />
            {!submission?.data.identityType || submission?.data.identityType === 'identityNumber' ? (
              <FormTextField
                submissionPath="coverPage.user.nationalIdentityNumber"
                label={TEXTS.statiske.identity.identityNumber}
              />
            ) : (
              <>
                <FormFirstName submissionPath="coverPage.user.firstName" />
                <FormSurname submissionPath="coverPage.user.surname" />
                <FormStreetAddress submissionPath="coverPage.user.address.streetAddress" />
                <FormPostalCode submissionPath="coverPage.user.address.postalCode" />
                <FormPostalName submissionPath="coverPage.user.address.postalName" />
                <FormCountrySelect submissionPath="coverPage.user.address.country" />
              </>
            )}
          </div>
        )}
      </FormBox>

      <SelectAttachmentList submissionPath="coverPage.attachments" />
    </>
  );
};

export default StaticPdfInputPage;
