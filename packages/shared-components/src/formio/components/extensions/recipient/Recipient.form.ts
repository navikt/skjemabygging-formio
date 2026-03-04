import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const recipientForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.role(),
      editFormDisplay.label({
        label: 'Ledetekst fødselsnummer / d-nummer',
        key: 'labels.nationalIdentityNumber',
        customConditional: 'show = data.role === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst fornavn',
        key: 'labels.firstName',
        customConditional: 'show = data.role === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst etternavn',
        key: 'labels.surname',
        customConditional: 'show = data.role === "person"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst organisasjonsnummer',
        key: 'labels.organization',
        customConditional: 'show = data.role === "organization"',
      }),
      editFormDisplay.description({
        label: 'Beskrivelse for org.nr.',
        key: 'descriptions.organization',
        customConditional: 'show = data.role === "organization"',
      }),
      editFormDisplay.label({
        label: 'Ledetekst virksomhetsnavn',
        key: 'labels.organizationName',
        customConditional: 'show = data.role === "organization"',
      }),
      editFormDisplay.description(),
    ]),
    validation([editFormValidation.required()]),
    api([editFormApi.key()]),
    conditional([editFormConditional.simpleConditional(), editFormConditional.advancedConditional()]),
  );
};

export default recipientForm;
