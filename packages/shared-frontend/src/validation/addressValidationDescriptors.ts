import {
  Component,
  dateUtils,
  Submission,
  SubmissionAddress,
  SubmissionMethod,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { resolveAddressType, shouldShowAddressTypeChoice } from '../components/address/addressUtils';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { ValidationDescriptor } from './validationDescriptorTypes';

const collectAddressDescriptors = (
  component: Component,
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? false;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as SubmissionAddress | undefined;
  const addressType = resolveAddressType(component, value, submissionMethod);
  const descriptors: ValidationDescriptor[] = [];

  if (shouldShowAddressTypeChoice(component, submissionMethod)) {
    descriptors.push({
      submissionPath: `${submissionPath}.borDuINorge`,
      field: component.customLabels?.livesInNorway ?? TEXTS.statiske.address.livesInNorway,
      rules: { required },
    });

    if (value?.borDuINorge === 'ja') {
      descriptors.push({
        submissionPath: `${submissionPath}.vegadresseEllerPostboksadresse`,
        field: TEXTS.statiske.address.yourContactAddress,
        rules: { required },
      });
    }
  }

  if (addressType === 'NORWEGIAN_ADDRESS' || addressType === 'POST_OFFICE_BOX') {
    descriptors.push(
      {
        submissionPath: `${submissionPath}.co`,
        field: TEXTS.statiske.address.co.label,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.${addressType === 'POST_OFFICE_BOX' ? 'postboks' : 'adresse'}`,
        field: addressType === 'POST_OFFICE_BOX' ? TEXTS.statiske.address.poBox : TEXTS.statiske.address.streetAddress,
        rules: { required, coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postnummer`,
        field: TEXTS.statiske.address.postalCode,
        rules: { required, postalCode: true },
      },
      {
        submissionPath: `${submissionPath}.bySted`,
        field: TEXTS.statiske.address.postalName,
        rules: { required, coverPageValue: true },
      },
    );
  }

  if (addressType === 'FOREIGN_ADDRESS') {
    descriptors.push(
      {
        submissionPath: `${submissionPath}.co`,
        field: TEXTS.statiske.address.co.label,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.adresse`,
        field: TEXTS.statiske.address.streetAddressLong,
        rules: { required, coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.bygning`,
        field: TEXTS.statiske.address.building,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postnummer`,
        field: TEXTS.statiske.address.postalCode,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.bySted`,
        field: TEXTS.statiske.address.location,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.region`,
        field: TEXTS.statiske.address.region,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.land`,
        field: TEXTS.statiske.address.country,
        rules: { required },
      },
    );
  }

  return descriptors;
};

const collectAddressValidityDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? false;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as
    { gyldigFraOgMed?: string; gyldigTilOgMed?: string } | undefined;
  const minDate = dateUtils.addDays(-365);
  const maxDate = dateUtils.addDays(365);

  return [
    {
      submissionPath: `${submissionPath}.gyldigFraOgMed`,
      field: TEXTS.statiske.address.validFrom,
      rules: { required, date: true, fromDate: minDate, toDate: maxDate },
    },
    {
      submissionPath: `${submissionPath}.gyldigTilOgMed`,
      field: TEXTS.statiske.address.validTo,
      rules: { date: true, fromDate: value?.gyldigFraOgMed || minDate, toDate: maxDate },
    },
  ];
};

export { collectAddressDescriptors, collectAddressValidityDescriptors };
