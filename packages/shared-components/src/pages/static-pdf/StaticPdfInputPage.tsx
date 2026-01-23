import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useForm } from '../../context/form/FormContext';
import FormPostalCode from './components/shared/address/FormPostalCode';
import FormPostalName from './components/shared/address/FormPostalName';
import FormStreetAddress from './components/shared/address/FormStreetAddress';
import FormBox from './components/shared/FormBox';
import FormNavUnitSelector from './components/shared/FormNavUnitSelector';
import FormRadio from './components/shared/FormRadio';
import FormTextField from './components/shared/FormTextField';
import FormFirstName from './components/shared/identity/FormFirstName';
import FormSurname from './components/shared/identity/FormSurname';
import SelectAttachmentList from './components/shared/SelectAttachmentList';

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
      <FormBox bottom="space-40">
        {enhetMaVelgesVedPapirInnsending ? (
          <FormNavUnitSelector submissionPath="navUnit" />
        ) : (
          <div>
            <FormRadio
              submissionPath="identityType"
              legend={TEXTS.statiske.identity.submissionFor}
              values={[
                {
                  label: TEXTS.statiske.identity.personIdentityNumber,
                  value: 'identityNumber',
                },
                {
                  label: TEXTS.statiske.identity.personNoIdentityNumber,
                  value: 'noIdentityNumber',
                },
              ]}
            />
            {submission?.data.identityType === 'identityNumber' ? (
              <FormTextField submissionPath="nationalIdentityNumber" label={TEXTS.statiske.identity.identityNumber} />
            ) : (
              <>
                <FormFirstName submissionPath="firstName" />
                <FormSurname submissionPath="surname" />
                <FormStreetAddress submissionPath="streetAddress" />
                <FormPostalCode submissionPath="postalCode" />
                <FormPostalName submissionPath="postalName" />
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
