import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useForm } from '../../context/form/FormContext';
import FormPostalCode from './components/shared/address/FormPostalCode';
import FormPostalName from './components/shared/address/FormPostalName';
import FormStreetAddress from './components/shared/address/FormStreetAddress';
import FormBox from './components/shared/FormBox';
import FormCountrySelect from './components/shared/FormCountrySelect';
import FormNavUnitSelect from './components/shared/FormNavUnitSelect';
import FormTextField from './components/shared/FormTextField';
import FormFirstName from './components/shared/identity/FormFirstName';
import FormSurname from './components/shared/identity/FormSurname';
import SelectAttachmentList from './components/shared/SelectAttachmentList';
import StaticPdfIdentityType from './components/shared/StaticPdfIdentityType';

const StaticPdfInputPage = () => {
  const { form, setSubmission, submission } = useForm();
  const { enhetMaVelgesVedPapirInnsending } = form.properties;

  useEffect(() => {
    if (!submission) {
      setSubmission({
        data: {
          identityType: 'identityNumber',
        },
      });
    }
  }, [setSubmission, submission]);

  return (
    <>
      <FormBox bottom="space-32">
        {enhetMaVelgesVedPapirInnsending ? (
          <FormNavUnitSelect submissionPath="navUnit" />
        ) : (
          <div>
            <StaticPdfIdentityType submissionPath="identityType" />
            {!submission?.data.identityType || submission?.data.identityType === 'identityNumber' ? (
              <FormTextField
                submissionPath="nationalIdentityNumber"
                label={TEXTS.statiske.identity.identityNumber}
                validators={{ required: true }}
              />
            ) : (
              <>
                <FormFirstName submissionPath="firstName" />
                <FormSurname submissionPath="surname" />
                <FormStreetAddress submissionPath="address.streetAddress" />
                <FormPostalCode submissionPath="address.postalCode" />
                <FormPostalName submissionPath="address.postalName" />
                <FormCountrySelect submissionPath="addreess.country" />
              </>
            )}
          </div>
        )}
      </FormBox>

      <SelectAttachmentList submissionPath="attachments" />
    </>
  );
};

export default StaticPdfInputPage;
