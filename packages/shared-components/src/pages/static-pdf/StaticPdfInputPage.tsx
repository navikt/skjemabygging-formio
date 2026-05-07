import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FormCountrySelect from './components/shared/address/FormCountrySelect';
import FormPostalCode from './components/shared/address/FormPostalCode';
import FormPostalName from './components/shared/address/FormPostalName';
import FormStreetAddress from './components/shared/address/FormStreetAddress';
import FormBox from './components/shared/form/FormBox';
import FormNavUnitSelect from './components/shared/FormNavUnitSelect';
import FormFirstName from './components/shared/identity/FormFirstName';
import FormNationalIdentityNumber from './components/shared/identity/FormNationalIdentityNumber';
import FormSurname from './components/shared/identity/FormSurname';
import SelectAttachmentList from './components/shared/SelectAttachmentList';
import StaticPdfIdentityType from './components/shared/StaticPdfIdentityType';
import {
  filterStaticPdfAttachments,
  normalizeStaticPdfAttachmentCodeFilter,
  pruneStaticPdfAttachmentSelections,
} from './staticPdfAttachmentFilter';

interface StaticPdfCoverPageData {
  attachments?: unknown;
  [key: string]: unknown;
}

const StaticPdfInputPage = () => {
  const { form, setSubmission, submission } = useForm();
  const { enhetMaVelgesVedPapirInnsending } = form.properties;
  const { currentLanguage } = useLanguages();
  const [searchParams] = useSearchParams();
  const attachments: Component[] = useMemo(() => {
    return navFormUtils.flattenComponents(form.components).filter((component) => component.type === 'attachment');
  }, [form.components]);
  const attachmentCodeFilter = useMemo(() => {
    return normalizeStaticPdfAttachmentCodeFilter(searchParams.get('filter'));
  }, [searchParams]);
  const filteredAttachments = useMemo(() => {
    return filterStaticPdfAttachments(attachments, attachmentCodeFilter);
  }, [attachmentCodeFilter, attachments]);
  const allowedAttachmentKeys = useMemo(() => {
    return new Set(filteredAttachments.map((attachment) => attachment.key));
  }, [filteredAttachments]);

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

  useEffect(() => {
    if (attachmentCodeFilter.length === 0) {
      return;
    }

    const coverPage = submission?.data?.coverPage;
    if (!coverPage || typeof coverPage !== 'object') {
      return;
    }

    const selectedAttachments = (coverPage as StaticPdfCoverPageData).attachments;
    if (!Array.isArray(selectedAttachments)) {
      return;
    }

    const prunedAttachments = pruneStaticPdfAttachmentSelections(selectedAttachments, allowedAttachmentKeys);
    if (prunedAttachments.length === selectedAttachments.length) {
      return;
    }

    setSubmission((prevSubmission) => {
      if (!prevSubmission) {
        return prevSubmission;
      }

      const currentCoverPage = prevSubmission.data?.coverPage;
      if (!currentCoverPage || typeof currentCoverPage !== 'object') {
        return prevSubmission;
      }

      const currentAttachments = (currentCoverPage as StaticPdfCoverPageData).attachments;
      if (!Array.isArray(currentAttachments)) {
        return prevSubmission;
      }

      const nextAttachments = pruneStaticPdfAttachmentSelections(currentAttachments, allowedAttachmentKeys);
      if (nextAttachments.length === currentAttachments.length) {
        return prevSubmission;
      }

      return {
        ...prevSubmission,
        data: {
          ...prevSubmission.data,
          coverPage: {
            ...currentCoverPage,
            attachments: nextAttachments,
          },
        },
      };
    });
  }, [allowedAttachmentKeys, attachmentCodeFilter.length, setSubmission, submission?.data?.coverPage]);

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

      <SelectAttachmentList attachments={filteredAttachments} submissionPath="coverPage.attachments" />
    </>
  );
};

export default StaticPdfInputPage;
