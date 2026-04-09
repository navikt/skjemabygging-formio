import { useEffect } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FormCountrySelect from './components/shared/address/FormCountrySelect';
import FormPostalCode from './components/shared/address/FormPostalCode';
import FormPostalName from './components/shared/address/FormPostalName';
import FormStreetAddress from './components/shared/address/FormStreetAddress';
import FormBox from './components/shared/form-adapters/FormBox';
import FormNavUnitSelect from './components/shared/FormNavUnitSelect';
import FormFirstName from './components/shared/identity/FormFirstName';
import FormNationalIdentityNumber from './components/shared/identity/FormNationalIdentityNumber';
import FormSurname from './components/shared/identity/FormSurname';
import SelectAttachmentList from './components/shared/SelectAttachmentList';
import StaticPdfIdentityType from './components/shared/StaticPdfIdentityType';

const StaticPdfInputPage = () => {
  const { form, setSubmission, submission } = useForm();
  const { enhetMaVelgesVedPapirInnsending } = form.properties;
  const { currentLanguage } = useLanguages();

  useEffect(() => {
    if (!submission) {
      const languageCode = currentLanguage.slice(0, 2);
      setSubmission({
        data: {
          identityType: 'identityNumber',
          coverPage: {
            languageCode,
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
              <FormNationalIdentityNumber
                submissionPath="coverPage.user.nationalIdentityNumber"
                validators={{ required: true, coverPage: true }}
              />
            ) : (
              <>
                <FormFirstName
                  submissionPath="coverPage.user.firstName"
                  validators={{ required: true, coverPage: true }}
                />
                <FormSurname submissionPath="coverPage.user.surname" validators={{ required: true, coverPage: true }} />
                <FormStreetAddress
                  submissionPath="coverPage.user.address.streetAddress"
                  validators={{ required: true, coverPage: true }}
                />
                <FormPostalCode
                  submissionPath="coverPage.user.address.postalCode"
                  validators={{ required: true, coverPage: true }}
                />
                <FormPostalName
                  submissionPath="coverPage.user.address.postalName"
                  validators={{ required: true, coverPage: true }}
                />
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
