import { Component, ComponentConditional, Enhetstype, FormPropertiesType } from '../../models';
import { TEXTS } from '../../texts';

type SendinnCollectionType = 'identified-person' | 'unidentified-person' | 'multiple-people';

interface NavUnitSelectComponent extends Component {
  type: 'navUnitSelect';
  /** Runtime lookup filters by these types, falling back to all units when none match. */
  unitTypes?: Enhetstype[];
}

const collectionCondition = (type: SendinnCollectionType, show = true): ComponentConditional => ({
  when: 'collectionType',
  eq: type,
  show,
});

const createNavUnitField = (key: string, properties: FormPropertiesType): NavUnitSelectComponent => ({
  type: 'navUnitSelect',
  key,
  label: TEXTS.statiske.navUnit.choose,
  description: properties.navUnitDescription,
  input: true,
  clearOnHide: true,
  validate: { required: true },
  ...(properties.enhetstyper ? { unitTypes: [...properties.enhetstyper] } : {}),
});

const createSendinnPaperCollection = (properties: FormPropertiesType): Component[] => {
  if (properties.hideUserTypes === true) {
    return [];
  }

  if (properties.enhetMaVelgesVedPapirInnsending === true) {
    return [createNavUnitField('navUnit', properties)];
  }

  return [
    {
      type: 'radiopanel',
      key: 'collectionType',
      label: TEXTS.statiske.identity.submissionFor,
      input: true,
      validate: { required: true, onlyAvailableItems: true },
      values: [
        { value: 'identified-person', label: TEXTS.statiske.identity.personIdentityNumber },
        { value: 'unidentified-person', label: TEXTS.statiske.identity.personNoIdentityNumber },
        { value: 'multiple-people', label: TEXTS.statiske.sendinn.collection.multiplePeople },
      ],
    },
    {
      type: 'container',
      key: 'yourInformation',
      label: TEXTS.statiske.identity.submissionFor,
      input: true,
      tree: true,
      yourInformation: true,
      clearOnHide: true,
      conditional: collectionCondition('multiple-people', false),
      components: [
        {
          type: 'container',
          key: 'identitet',
          label: TEXTS.statiske.identity.identityNumber,
          input: true,
          tree: true,
          clearOnHide: true,
          conditional: collectionCondition('identified-person'),
          components: [
            {
              type: 'fnrfield',
              key: 'identitetsnummer',
              label: TEXTS.statiske.identity.identityNumber,
              input: true,
              validate: { required: true },
            },
          ],
        },
        {
          type: 'firstName',
          key: 'fornavn',
          label: TEXTS.statiske.identity.firstName,
          input: true,
          clearOnHide: true,
          validate: { required: true },
          conditional: collectionCondition('unidentified-person'),
        },
        {
          type: 'surname',
          key: 'etternavn',
          label: TEXTS.statiske.identity.surname,
          input: true,
          clearOnHide: true,
          validate: { required: true },
          conditional: collectionCondition('unidentified-person'),
        },
        {
          type: 'navAddress',
          key: 'adresse',
          label: TEXTS.statiske.address.yourContactAddress,
          input: true,
          clearOnHide: true,
          addressTypeWizard: 'user',
          validate: { required: true },
          conditional: collectionCondition('unidentified-person'),
        },
      ],
    },
    {
      type: 'fieldset',
      key: 'navContact',
      label: TEXTS.statiske.navUnit.choose,
      conditional: collectionCondition('unidentified-person'),
      components: [
        {
          type: 'radiopanel',
          key: 'hasNavContact',
          label: TEXTS.statiske.sendinn.collection.hasNavContact,
          input: true,
          clearOnHide: true,
          validate: { required: true, onlyAvailableItems: true },
          values: [
            { value: 'ja', label: TEXTS.common.yes },
            { value: 'nei', label: TEXTS.common.no },
          ],
        },
        {
          ...createNavUnitField('navContactUnit', properties),
          conditional: { when: 'hasNavContact', eq: 'ja', show: true },
        },
      ],
    },
    {
      ...createNavUnitField('navUnit', properties),
      conditional: collectionCondition('multiple-people'),
    },
  ];
};

export { createSendinnPaperCollection };
export type { NavUnitSelectComponent, SendinnCollectionType };
