import {
  attachmentUtils,
  currencyUtils,
  dateUtils,
  formatUtils,
  numberUtils,
  stringUtils,
  TEXTS,
  type Component,
  type ComponentValue,
  type FormPropertiesType,
  type Submission,
  type SubmissionMethod,
  type TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { addressToString } from '../../../pdf/components/customized/address/addressUtils';
import { getIdentityLabel, getIdentityValue } from '../../../pdf/components/customized/identity/identityUtils';
import { getDrivingListItems } from '../../../pdf/components/system/driving-list/drivingListUtils';
import formComponentUtils from '../../../pdf/utils/formComponent';
import type { SharedFormSummaryFieldNode, SharedFormSummaryPrimitive, SharedFormSummaryValue } from '../../types';

type SummaryValueFormatter = (value: any) => string | number | boolean | null | undefined;

interface SummaryBuilderProps {
  component: Component;
  submissionPath: string;
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage?: string;
  formProperties?: FormPropertiesType;
  submissionMethod?: SubmissionMethod;
}

interface DefaultSummaryBuilderProps extends SummaryBuilderProps {
  valueFormat?: SummaryValueFormatter;
}

const getSummaryLabel = (component: Component, translate: TranslateFunction) => {
  const { hideLabel, label } = component;

  if (!label || hideLabel) {
    return undefined;
  }

  return translate(label);
};

const toSummaryPrimitive = (value: unknown): SharedFormSummaryPrimitive | undefined => {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
};

const createFieldNode = (
  component: Component,
  submissionPath: string,
  translate: TranslateFunction,
  values: SharedFormSummaryValue[],
): SharedFormSummaryFieldNode => ({
  type: 'field',
  component,
  submissionPath,
  key: component.key,
  label: getSummaryLabel(component, translate),
  description: component.description ? translate(component.description) : undefined,
  values,
});

const buildDefaultSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
  valueFormat,
}: DefaultSummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  const formattedValue = valueFormat === undefined ? submissionValue : valueFormat(submissionValue);
  const summaryValue = toSummaryPrimitive(formattedValue);

  if (summaryValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: summaryValue }]);
};

const getSelectedValue = (componentValues: ComponentValue[] | undefined, value: unknown) => {
  return componentValues?.find((valueObject) => String(valueObject.value) === String((value as any)?.value ?? value));
};

const buildDefaultListSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
}: SummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const valueObject = getSelectedValue(component.values, submissionValue);

  if (!valueObject?.label) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: translate(valueObject.label) }]);
};

const buildDefaultSelectSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
}: SummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const selectedLabel = (submissionValue as { label?: string } | undefined)?.label;

  if (!selectedLabel) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: translate(selectedLabel) }]);
};

const buildDefaultHtmlSummaryNode = ({
  component,
  submissionPath,
  translate,
}: Omit<SummaryBuilderProps, 'submission'>): SharedFormSummaryFieldNode | undefined => {
  const { textDisplay, content } = component;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ html: translate(content) }]);
};

const buildCheckboxSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (!submissionValue) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: translate(TEXTS.common.yes) }]);
};

const buildNumberSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    { value: numberUtils.toLocaleString(submissionValue) },
  ]);
};

const buildDateSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: dateUtils.toLocaleDate(submissionValue) }]);
};

const buildMonthSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
  currentLanguage,
}: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined || !currentLanguage) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    { value: stringUtils.toPascalCase(dateUtils.toLongMonthFormat(submissionValue, currentLanguage)) },
  ]);
};

const buildSelectBoxesSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const translatedValues =
    component.values
      ?.filter((checkbox) => submissionValue?.[checkbox.value] === true)
      .map((checkbox) => translate(checkbox.label)) ?? [];

  if (translatedValues.length === 0) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ values: translatedValues }]);
};

const buildAddressSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: addressToString(submissionValue) }]);
};

const buildAddressValiditySummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined || (!submissionValue.gyldigFraOgMed && !submissionValue.gyldigTilOgMed)) {
    return undefined;
  }

  const values = [
    submissionValue.gyldigFraOgMed
      ? {
          label: translate(TEXTS.statiske.address.validFrom),
          value: dateUtils.toLocaleDate(submissionValue.gyldigFraOgMed),
        }
      : undefined,
    submissionValue.gyldigTilOgMed
      ? {
          label: translate(TEXTS.statiske.address.validTo),
          value: dateUtils.toLocaleDate(submissionValue.gyldigTilOgMed),
        }
      : undefined,
  ].filter(Boolean) as SharedFormSummaryValue[];

  if (values.length === 0) {
    return undefined;
  }

  return { ...createFieldNode(component, submissionPath, translate, values), label: undefined };
};

const buildAccountNumberSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    { value: formatUtils.formatAccountNumber(submissionValue) },
  ]);
};

const buildIbanSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: formatUtils.formatIBAN(submissionValue) }]);
};

const buildCurrencySummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    {
      value: currencyUtils.toLocaleString(submissionValue, {
        iso: true,
        currency: component.currency,
        integer: component.inputType === 'numeric',
      }),
    },
  ]);
};

const buildIdentitySummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined || (!submissionValue?.identitetsnummer && !submissionValue?.fodselsdato)) {
    return undefined;
  }

  return {
    ...createFieldNode(component, submissionPath, translate, [{ value: getIdentityValue(submissionValue) }]),
    label: translate(getIdentityLabel(submissionValue)),
  };
};

const buildNationalIdentityNumberSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
}: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    { value: formatUtils.formatNationalIdentityNumber(submissionValue) },
  ]);
};

const buildPhoneNumberSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    submissionValue === undefined ||
    (component.showAreaCode && (submissionValue.areaCode === undefined || submissionValue.number === undefined))
  ) {
    return undefined;
  }

  const phoneNumber = component.showAreaCode
    ? `${submissionValue.areaCode} ${formatUtils.formatPhoneNumber(submissionValue.number, submissionValue.areaCode)}`
    : submissionValue;

  return createFieldNode(component, submissionPath, translate, [{ value: phoneNumber }]);
};

const buildSenderSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  const labels = component.labels ?? {};
  const values =
    component.senderRole === 'organization'
      ? [
          submissionValue.organization?.number
            ? { label: translate(labels.organizationNumber), value: submissionValue.organization.number }
            : undefined,
          submissionValue.organization?.name
            ? { label: translate(labels.organizationName), value: submissionValue.organization.name }
            : undefined,
        ]
      : [
          submissionValue.person?.nationalIdentityNumber
            ? {
                label: translate(labels.nationalIdentityNumber),
                value: submissionValue.person.nationalIdentityNumber,
              }
            : undefined,
          submissionValue.person?.firstName
            ? { label: translate(labels.firstName), value: submissionValue.person.firstName }
            : undefined,
          submissionValue.person?.surname
            ? { label: translate(labels.surname), value: submissionValue.person.surname }
            : undefined,
        ];

  const filteredValues = values.filter(Boolean) as SharedFormSummaryValue[];

  if (filteredValues.length === 0) {
    return undefined;
  }

  return { ...createFieldNode(component, submissionPath, translate, filteredValues), label: undefined };
};

const buildAttachmentSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
  formProperties,
  submissionMethod,
}: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined || !submissionValue.key) {
    return undefined;
  }

  const values = [
    { value: translate(attachmentUtils.getAttachmentLabel(submissionValue.key, submissionMethod)) },
    submissionValue.additionalDocumentation ? { value: translate(submissionValue.additionalDocumentation) } : undefined,
    submissionValue.showDeadline && formProperties?.ettersendelsesfrist
      ? { value: translate(TEXTS.statiske.attachment.deadline, { deadline: formProperties.ettersendelsesfrist }) }
      : undefined,
  ].filter(Boolean) as SharedFormSummaryValue[];

  return createFieldNode(component, submissionPath, translate, values);
};

const buildActivitiesSummaryNode = ({ component, submissionPath, submission, translate }: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [{ value: submissionValue.text }]);
};

const buildDrivingListSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
  currentLanguage,
}: SummaryBuilderProps) => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    submissionValue === undefined ||
    !submissionValue?.dates ||
    submissionValue.dates.length === 0 ||
    !currentLanguage
  ) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, [
    { value: translate(TEXTS.statiske.drivingList.summaryDescription) },
    { values: getDrivingListItems(submissionValue.dates, currentLanguage, translate) },
  ]);
};

export {
  buildAccountNumberSummaryNode,
  buildActivitiesSummaryNode,
  buildAddressSummaryNode,
  buildAddressValiditySummaryNode,
  buildAttachmentSummaryNode,
  buildCheckboxSummaryNode,
  buildCurrencySummaryNode,
  buildDateSummaryNode,
  buildDefaultHtmlSummaryNode,
  buildDefaultListSummaryNode,
  buildDefaultSelectSummaryNode,
  buildDefaultSummaryNode,
  buildDrivingListSummaryNode,
  buildIbanSummaryNode,
  buildIdentitySummaryNode,
  buildMonthSummaryNode,
  buildNationalIdentityNumberSummaryNode,
  buildNumberSummaryNode,
  buildPhoneNumberSummaryNode,
  buildSelectBoxesSummaryNode,
  buildSenderSummaryNode,
  getSummaryLabel,
};

export type { DefaultSummaryBuilderProps, SummaryBuilderProps, SummaryValueFormatter };
