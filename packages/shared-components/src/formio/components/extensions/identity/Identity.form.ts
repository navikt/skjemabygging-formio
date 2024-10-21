import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';

const identityForm = () => {
  const { display, api, data, conditional, createTabs } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.customLabels({
        key: 'doYouHaveIdentityNumber',
        label: 'Ledetekst',
        value: TEXTS.statiske.identity.doYouHaveIdentityNumber,
      }),
    ]),
    data([
      editFormData.prefillKey({prefillKey: 'sokerIdentifikasjonsnummer'}),
    ]),
    api([
      editFormApi.key(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default identityForm;
