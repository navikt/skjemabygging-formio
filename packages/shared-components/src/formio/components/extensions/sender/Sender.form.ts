import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';

const senderForm = () => {
  const { api, conditional, createTabs, display } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label({
        label: 'Ledetekst fødselsnummer / d-nummer',
        key: 'labels.nationalIdentityNumber',
        customConditional: 'show = row.senderRole === "person"',
      }),
      editFormDisplay.description({
        label: 'Beskrivelse for fødselsnummer / d-nummer',
        key: 'descriptions.nationalIdentityNumber',
        customConditional: 'show = row.senderRole === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst fornavn',
        key: 'labels.firstName',
        customConditional: 'show = row.senderRole === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst etternavn',
        key: 'labels.surname',
        customConditional: 'show = row.senderRole === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst organisasjonsnummer',
        key: 'labels.organizationNumber',
        customConditional: 'show = row.senderRole === "organization"',
      }),
      editFormDisplay.description({
        label: 'Beskrivelse for org.nr.',
        key: 'descriptions.organizationNumber',
        customConditional: 'show = row.senderRole === "organization"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst virksomhetsnavn',
        key: 'labels.organizationName',
        customConditional: 'show = row.senderRole === "organization"',
      }),
    ]),
    api([editFormApi.key()]),
    conditional([editFormConditional.simpleConditional(), editFormConditional.advancedConditional()]),
  );
};

export default senderForm;
