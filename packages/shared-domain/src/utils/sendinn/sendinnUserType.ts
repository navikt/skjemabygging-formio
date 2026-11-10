import {
  createAddress,
  createContainer,
  createFirstName,
  createFormGroup,
  createNationalIdentityNumber,
  createRadioPanel,
  createSurname,
} from '../../form-components';
import { Component, ComponentConditional, Enhetstype, FormPropertiesType } from '../../models';
import { TEXTS } from '../../texts';

type SendinnUserType = 'identified-person' | 'unidentified-person' | 'multiple-people';

interface NavUnitSelectComponent extends Component {
  type: 'navUnitSelect';
  /** Runtime lookup filters by these types, falling back to all units when none match. */
  unitTypes?: Enhetstype[];
}

const userTypeCondition = (type: SendinnUserType, show = true): ComponentConditional => ({
  when: 'userType',
  eq: type,
  show,
});

const createNavUnitField = (key: string, properties: FormPropertiesType): NavUnitSelectComponent => ({
  type: 'navUnitSelect',
  key,
  label: TEXTS.statiske.navUnit.choose,
  description: properties.navUnitDescription,
  fieldSize: 'input--xl',
  input: true,
  clearOnHide: true,
  validate: { required: true },
  ...(properties.enhetstyper ? { unitTypes: [...properties.enhetstyper] } : {}),
});

const createSendinnUserTypeComponents = (properties: FormPropertiesType): Component[] => {
  if (properties.hideUserTypes === true) {
    return [];
  }

  if (properties.enhetMaVelgesVedPapirInnsending === true) {
    return [createNavUnitField('navUnit', properties)];
  }

  return [
    createRadioPanel({
      key: 'userType',
      label: TEXTS.statiske.identity.submissionFor,
      validate: { required: true, onlyAvailableItems: true },
      values: [
        { value: 'identified-person', label: TEXTS.statiske.identity.personIdentityNumber },
        { value: 'unidentified-person', label: TEXTS.statiske.identity.personNoIdentityNumber },
        { value: 'multiple-people', label: TEXTS.statiske.sendinn.userType.multiplePeople },
      ],
    }),
    createContainer({
      key: 'dineOpplysninger',
      label: 'Dine opplysninger',
      yourInformation: true,
      conditional: userTypeCondition('multiple-people', false),
      components: [
        createContainer({
          key: 'identitet',
          label: 'Identitet',
          conditional: userTypeCondition('identified-person'),
          components: [createNationalIdentityNumber({ key: 'identitetsnummer' })],
        }),
        createFirstName({ conditional: userTypeCondition('unidentified-person') }),
        createSurname({ conditional: userTypeCondition('unidentified-person') }),
        createAddress({ addressTypeWizard: 'user', conditional: userTypeCondition('unidentified-person') }),
      ],
    }),
    createFormGroup({
      key: 'navContact',
      label: TEXTS.statiske.navUnit.choose,
      legend: TEXTS.statiske.navUnit.choose,
      hideLabel: true,
      backgroundColor: false,
      conditional: userTypeCondition('unidentified-person'),
      components: [
        createRadioPanel({
          key: 'hasNavContact',
          label: TEXTS.statiske.sendinn.userType.hasNavContact,
          validate: { required: true, onlyAvailableItems: true },
        }),
        {
          ...createNavUnitField('navContactUnit', properties),
          conditional: { when: 'hasNavContact', eq: 'ja', show: true },
        },
      ],
    }),
    {
      ...createNavUnitField('navUnit', properties),
      conditional: userTypeCondition('multiple-people'),
    },
  ];
};

export { createSendinnUserTypeComponents };
export type { NavUnitSelectComponent, SendinnUserType };
