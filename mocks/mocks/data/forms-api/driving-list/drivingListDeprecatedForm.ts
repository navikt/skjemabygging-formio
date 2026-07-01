import { drivingList, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const drivingListDeprecatedForm = () =>
  form({
    title: 'Testing driving list',
    formNumber: 'testdrivinglist',
    path: 'testdrivinglist',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [drivingList({ key: 'drivinglist' })],
      }),
    ],
    properties: formProperties({ formNumber: 'testdrivinglist', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const drivingListDeprecatedTranslations = () => getMockTranslationsFromForm(drivingListDeprecatedForm());

export { drivingListDeprecatedForm, drivingListDeprecatedTranslations };
